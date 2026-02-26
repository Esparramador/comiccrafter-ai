# ComicCrafter IA Stories

## Overview
All-in-one platform for AI-powered creative content generation: comics, animated series, 3D characters, educational videos, voice actors. Built with Express + Vite + React + PostgreSQL.

## Architecture
- **Frontend**: React + TypeScript + Vite, TailwindCSS, shadcn/ui, Wouter routing, React Query
- **Backend**: Express.js, Drizzle ORM, PostgreSQL
- **AI (Manus/OpenAI Direct)**: OPENAI_API_KEY - GPT-4o for text, DALL-E 3 HD for images (primary engine)
- **AI (OpenAI Integrations)**: via Replit AI Integrations (gpt-image-1 fallback for images)
- **AI (Gemini)**: via Replit AI Integrations (gemini-2.5-flash for chat/analysis, fallback for economist)
- **3D**: Tripo3D API (text-to-model, image-to-model, GLB export)
- **Voice**: ElevenLabs API (TTS, voice listing, multilingual v2)
- **Google Drive**: OAuth connector for file upload/listing
- **Google Sheets**: OAuth connector for data export/analytics
- **Gmail**: OAuth connector for email notifications
- **Auth**: localStorage-based mockup (`isLogged` key), admin PIN: `14032025`

## Database Tables
- `users` - Basic auth (varchar UUID PK)
- `characters` - Character repository (serial PK, name, role, description, voice, has3D, photoUrls array)
- `generated_images` - AI-generated images (serial PK, prompt, imageUrl, category)
- `scripts` - AI-generated scripts/guiones (serial PK, title, content, genre, language)
- `comic_pages` - Generated comic pages (serial PK, title, panelImages array, panelTexts jsonb, style)
- `app_users` - Platform users for admin management (serial PK, email, plan, status, totalGenerations)
- `service_limits` - Per-plan service quotas (serial PK, planName, serviceName, maxQuantity, enabled)
- `subscription_plans` - Subscription plans (serial PK, name, displayName, description, priceMonthly, priceYearly, currency, features jsonb, maxImages/Videos/3D/Scripts/Voices, isActive, sortOrder, badgeColor)
- `conversations` - Gemini chat conversations (serial PK, title)
- `messages` - Chat messages (serial PK, conversationId FK, role, content)

## API Routes
### Content CRUD
- `GET/POST/PUT/DELETE /api/characters` - Character CRUD
- `GET/DELETE /api/images` - Generated images
- `GET/DELETE /api/scripts` - Scripts
- `GET/DELETE /api/comic-pages` - Comic pages

### AI Generation (OpenAI)
- `POST /api/ai/generate-script` - AI script generation
- `POST /api/ai/generate-character` - AI character creation (chat + image)
- `POST /api/ai/generate-cover` - AI cover art generation
- `POST /api/ai/generate-comic-page` - AI comic page panels
- `POST /api/ai/generate-image` - Generic AI image generation

### AI (Gemini)
- `POST /api/ai/gemini-chat` - Gemini chat (prompt + optional systemPrompt)
- `POST /api/ai/gemini-analyze` - Script/character/scene analysis
- `POST /api/ai/economist` - AI Economist (Manus GPT-4o primary, Gemini fallback)

### Manus AI (Direct OpenAI)
- `POST /api/ai/manus-gallery` - Batch image gallery generator (theme + count + style)
- All generation routes use Manus (GPT-4o + DALL-E 3 HD) as primary engine with Replit integrations as fallback
- `GET/POST/DELETE /api/conversations` - Chat conversation CRUD
- `POST /api/conversations/:id/messages` - Chat with streaming (SSE)

### 3D Models (Tripo3D)
- `POST /api/ai/generate-3d` - Text-to-3D model
- `POST /api/ai/upload-3d-image` - Upload image for image-to-3D
- `POST /api/ai/generate-3d-from-image` - Generate 3D from uploaded image
- `GET /api/ai/3d-status/:taskId` - Poll 3D task status
- `GET /api/ai/3d-download/:taskId` - Download GLB model

### Voice (ElevenLabs)
- `GET /api/voices` - List available ElevenLabs voices
- `GET /api/voices/:voiceId` - Get voice details
- `POST /api/ai/generate-voice` - Text-to-speech (returns audio/mpeg)

### Google Services
- `POST /api/google/drive/upload` - Upload file to Drive
- `GET /api/google/drive/files` - List Drive files
- `POST /api/google/sheets/create` - Create spreadsheet
- `POST /api/google/sheets/export` - Export data to sheet
- `GET /api/google/sheets/read` - Read sheet data
- `POST /api/google/mail/send` - Send email via Gmail

### Admin
- `GET /api/admin/stats` - Dashboard stats (real counts + plan breakdown + active/banned)
- `GET/POST/PUT/DELETE /api/admin/users` - User management
- `GET/POST/PUT/DELETE /api/admin/service-limits` - Service limits CRUD
- `GET/POST/PUT/DELETE /api/admin/plans` - Subscription plans CRUD

## Frontend Routes
- `/` - Hub (redesigned: hero carousel, feature cards with images, stats, CTA)
- `/story-weaver` - Story/comic/cover generation wizard
- `/forge-3d` - 3D model generation (real Tripo3D)
- `/video` - Video creation with AI director chat + video previewer
- `/voice` - Voice studio (real ElevenLabs TTS + voice assignment)
- `/personajes` - Character gallery (DB-backed)
- `/crear-personaje` - Character creation (AI or manual, DB-backed)
- `/mis-imagenes` - Image gallery
- `/mis-videos` - Video gallery
- `/mis-voces` - Voice gallery
- `/admin` - Admin dashboard (tabbed: Dashboard, Users, Plans, Limits, AI Economist)
- `/login` - Login page

## Generated Assets (client/public/)
- `logo-icon.png` - App logo icon
- `hero-bg-1.png`, `hero-bg-2.png`, `hero-bg-3.png` - Hero carousel backgrounds
- `feature-script.png` - Script writing feature image
- `feature-characters.png` - Character design feature image
- `feature-3d.png` - 3D modeling feature image
- `feature-voice.png` - Voice acting feature image
- `feature-video.png` - Video animation feature image
- `feature-styles.png` - Art styles feature image

## Key Files
- `shared/schema.ts` - Drizzle schema (all tables including subscription_plans + chat re-exports)
- `shared/models/chat.ts` - Gemini chat DB tables (conversations, messages)
- `server/routes.ts` - All API routes (AI, Google, admin, plans, economist)
- `server/storage.ts` - DatabaseStorage class (Drizzle queries)
- `server/db.ts` - Database connection (Neon/PostgreSQL)
- `server/manus-ai.ts` - Manus/OpenAI Direct client (GPT-4o + DALL-E 3 HD + batch gallery)
- `server/gemini.ts` - Gemini AI client
- `server/tripo3d.ts` - Tripo3D API client
- `server/elevenlabs.ts` - ElevenLabs API client
- `server/google-drive.ts` - Google Drive OAuth client
- `server/google-sheets.ts` - Google Sheets OAuth client
- `server/google-mail.ts` - Gmail OAuth client
- `server/replit_integrations/image/client.ts` - OpenAI image generation helpers
- `server/replit_integrations/chat/` - Gemini chat routes + storage
- `client/src/App.tsx` - Main app with routing and redesigned navbar
- `client/src/components/ai-progress.tsx` - Reusable AI generation progress bar component
- `client/src/lib/queryClient.ts` - React Query + apiRequest helper

## Admin Dashboard Features
- **Dashboard tab**: Stats overview, plan distribution chart, subscription summary, conversion rate
- **Users tab**: Real user tracking (email, plan, generations, status, paid/free), search, ban/unban
- **Plans tab**: Create/edit/delete subscription plans with full pricing, limits, features, colors
- **Limits tab**: Service limits config per plan (images, videos, 3D, scripts, voices)
- **AI Economist tab**: Gemini-powered market analyst for pricing strategy, Shopify advice, competition analysis

## Shopify Integration (Planned)
- No Replit integration available for Shopify
- Planned approach: Shopify Buy SDK (headless) for frontend checkout
- User needs to provide: Shopify store domain + Storefront Access Token
- AI Economist can advise on Shopify setup strategy

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection
- `AI_INTEGRATIONS_OPENAI_*` - OpenAI via Replit integrations
- `AI_INTEGRATIONS_GEMINI_*` - Gemini via Replit integrations
- `TRIPO3D_API_KEY` - Tripo3D 3D model generation
- `ELEVENLABS_API_KEY` - ElevenLabs voice synthesis
- `REPLIT_CONNECTORS_HOSTNAME` - Google OAuth connectors (auto-injected)

## Important Notes
- `queryClient` import MUST be from `./lib/queryClient`
- Never nest `<Link><a>` (wouter)
- Google clients must NEVER be cached — always call `getUncachable*Client()` fresh
- Characters use PostgreSQL (was localStorage)
- Story weaver uses real OpenAI API for scripts, covers, and comic pages
- Superuser email: sadiagiljoan@gmail.com
- Service limits auto-seeded on startup (free/pro/vip plans)
