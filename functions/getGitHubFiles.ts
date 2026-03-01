import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const githubToken = Deno.env.get("GITHUB_TOKEN");
        if (!githubToken) {
            return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
        }

        const { repo, path = "pages" } = await req.json();

        if (!repo) {
            return Response.json({ error: 'repo parameter required' }, { status: 400 });
        }

        // Fetch files from GitHub
        const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            return Response.json({ error: 'Failed to fetch from GitHub' }, { status: response.status });
        }

        const files = await response.json();
        return Response.json({ files });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});