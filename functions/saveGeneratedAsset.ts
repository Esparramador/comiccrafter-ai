import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, type, file, previewImageUrl, metadata } = await req.json();

    if (!title || !type || !file) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upload file to private storage
    const fileUri = await base44.integrations.Core.UploadPrivateFile({ file });

    // Create asset record
    const asset = await base44.entities.GeneratedAsset.create({
      title,
      type,
      preview_image_url: previewImageUrl,
      file_uri: fileUri.file_uri,
      metadata: metadata || {},
      status: 'completed'
    });

    return Response.json(asset);
  } catch (error) {
    console.error('Error saving asset:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});