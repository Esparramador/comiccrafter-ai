import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { code, shop } = await req.json();

    const storeUrl = shop || Deno.env.get("SHOPIFY_STORE_URL");
    const apiKey = Deno.env.get("SHOPIFY_API_KEY");
    const apiSecret = Deno.env.get("SHOPIFY_API_SECRET");

    if (!storeUrl || !apiKey || !apiSecret) {
      return Response.json({
        error: 'Faltan credenciales. Verifica SHOPIFY_STORE_URL, SHOPIFY_API_KEY y SHOPIFY_API_SECRET.'
      }, { status: 400 });
    }

    // Limpiar la URL de la tienda
    const cleanShop = storeUrl.replace(/https?:\/\//, '').replace(/\/$/, '');

    // Si no hay code, simplemente verificar credenciales existentes
    if (!code) {
      // Intentar usar API_KEY directamente como access token (Custom App)
      const testRes = await fetch(`https://${cleanShop}/admin/api/2024-01/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (testRes.ok) {
        const data = await testRes.json();
        return Response.json({
          success: true,
          mode: 'custom_app',
          message: 'Tu API Key funciona como Access Token directamente.',
          access_token: apiKey,
          shop: data.shop?.name,
          domain: data.shop?.domain
        });
      }

      return Response.json({
        success: false,
        message: 'El API Key no funciona como token directo. Proporciona un "code" del flujo OAuth.',
        oauth_url: `https://${cleanShop}/admin/oauth/authorize?client_id=${apiKey}&scope=read_products,write_products,read_orders,write_orders&redirect_uri=${req.headers.get('origin') || 'http://localhost:5173'}/oauth/callback`
      });
    }

    // Intercambio de código OAuth → Access Token
    const tokenRes = await fetch(`https://${cleanShop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code: code
      })
    });

    if (!tokenRes.ok) {
      const error = await tokenRes.text();
      return Response.json({ error: `Error de Shopify: ${error}` }, { status: tokenRes.status });
    }

    const tokenData = await tokenRes.json();

    return Response.json({
      success: true,
      access_token: tokenData.access_token,
      scope: tokenData.scope,
      message: '✅ Token generado correctamente. Guarda este token como SHOPIFY_ACCESS_TOKEN en tus secrets.'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});