import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assetId } = await req.json();

    if (!assetId) {
      return Response.json({ error: 'Missing assetId' }, { status: 400 });
    }

    const asset = await base44.entities.GeneratedAsset.get(assetId);

    if (!asset) {
      return Response.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Create signed URL for private file (30 minutes expiry)
    const signedUrl = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: asset.file_uri,
      expires_in: 1800
    });

    return Response.json({
      signed_url: signedUrl.signed_url,
      fileName: asset.title
    });
  } catch (error) {
    console.error('Error getting download URL:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});