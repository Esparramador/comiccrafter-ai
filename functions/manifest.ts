Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const manifest = {
    name: "ComicCrafter - Crea Comics y Videos IA",
    short_name: "ComicCrafter",
    description: "Crea cómics, vídeos animados, cortometrajes y más con inteligencia artificial",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0a0a0f",
    theme_color: "#8b5cf6",
    icons: [
      {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%238b5cf6' width='192' height='192'/><circle cx='96' cy='96' r='60' fill='%23ec4899'/><path d='M96 50L110 85H147L120 105L130 140L96 120L62 140L72 105L45 85H82Z' fill='%23fbbf24'/></svg>",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect fill='%238b5cf6' width='512' height='512'/><circle cx='256' cy='256' r='160' fill='%23ec4899'/><path d='M256 133L282 227H382L306 280L332 374L256 321L180 374L206 280L130 227H230Z' fill='%23fbbf24'/></svg>",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ],
    categories: ["productivity", "graphics"],
    shortcuts: [
      {
        name: "Crear Comic",
        short_name: "Comic",
        description: "Crea un nuevo cómic",
        url: "/CreateComic",
        icons: [
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><rect fill='%238b5cf6' width='96' height='96' rx='20'/><text fill='%23fff' font-size='48' x='24' y='60'>📖</text></svg>",
            sizes: "96x96",
            type: "image/svg+xml"
          }
        ]
      },
      {
        name: "Crear Video",
        short_name: "Video",
        description: "Crea un nuevo vídeo animado",
        url: "/VideoProjects",
        icons: [
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><rect fill='%23ec4899' width='96' height='96' rx='20'/><text fill='%23fff' font-size='48' x='24' y='60'>🎬</text></svg>",
            sizes: "96x96",
            type: "image/svg+xml"
          }
        ]
      }
    ],
    prefer_related_applications: false
  };

  return Response.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});