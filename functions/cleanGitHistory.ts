import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
const REPO = "Esparramador/comiccrafter-ai";
const BRANCH = "shopify-theme";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const headers = {
            "Authorization": `Bearer ${GITHUB_TOKEN}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json"
        };

        // Step 1: Get all files from current branch tree
        const branchRes = await fetch(`https://api.github.com/repos/${REPO}/git/ref/heads/${BRANCH}`, { headers });
        if (!branchRes.ok) {
            const err = await branchRes.text();
            return Response.json({ error: `Branch fetch failed: ${err}` }, { status: 500 });
        }
        const branchData = await branchRes.json();
        const currentSha = branchData.object.sha;

        // Step 2: Get the full tree (recursive)
        const commitRes = await fetch(`https://api.github.com/repos/${REPO}/git/commits/${currentSha}`, { headers });
        const commitData = await commitRes.json();
        const treeSha = commitData.tree.sha;

        const treeRes = await fetch(`https://api.github.com/repos/${REPO}/git/trees/${treeSha}?recursive=1`, { headers });
        const treeData = await treeRes.json();

        // Step 3: Create a new orphan commit by creating a new commit with no parent
        // We reuse the same tree (current state of files) but with no parent commit
        const newCommitRes = await fetch(`https://api.github.com/repos/${REPO}/git/commits`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                message: "Shopify theme clean - optimized images only (history cleared)",
                tree: treeSha,
                parents: [] // No parents = orphan commit
            })
        });

        if (!newCommitRes.ok) {
            const err = await newCommitRes.text();
            return Response.json({ error: `Commit creation failed: ${err}` }, { status: 500 });
        }

        const newCommit = await newCommitRes.json();
        const newCommitSha = newCommit.sha;

        // Step 4: Force update the branch reference to point to new orphan commit
        const updateRefRes = await fetch(`https://api.github.com/repos/${REPO}/git/refs/heads/${BRANCH}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
                sha: newCommitSha,
                force: true
            })
        });

        if (!updateRefRes.ok) {
            const err = await updateRefRes.text();
            return Response.json({ error: `Ref update failed: ${err}` }, { status: 500 });
        }

        return Response.json({
            success: true,
            message: `Branch '${BRANCH}' history cleared successfully. New commit: ${newCommitSha}`,
            new_commit_sha: newCommitSha,
            files_preserved: treeData.tree.length
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});