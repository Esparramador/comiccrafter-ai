# Comic Crafter

## Overview
All-in-one platform for AI-powered creative content generation: comics, animated series, 3D characters, educational videos, voice actors. Built with Express + Vite + React + PostgreSQL.

## Architecture
- **Frontend**: React + TypeScript + Vite, TailwindCSS, shadcn/ui, Wouter routing, React Query
- **Backend**: Express.js, Drizzle ORM, PostgreSQL
- **AI Cost Optimization**: Gemini (free tier) PRIMARY for all text generation. Manus/DALL-E 3 HD ONLY for image generation.
- **AI (Gemini)**: via Replit AI Integrations (gemini-2.5-flash for chat/analysis/scripts/prompts - FREE)
- **AI (Manus/OpenAI Direct)**: OPENAI_API_KEY - DALL-E 3 HD for images only (paid)
- **3D**: Tripo3D API (text-to-model, image-to-model, GLB export)
- **Voice**: ElevenLabs API (TTS, voice listing, multilingual v2)
- **Google Drive/Sheets/Gmail**: OAuth connectors
- **Shopify**: comic-crafter.myshopify.com (comiccrafter.es) - REST Admin API
- **Auth**: JWT-based real authentication system. Google Sign-In + email/password. Admin PIN: `14032025`, superuser: sadiagiljoan@gmail.com

## Authentication System
- **JWT tokens** stored in localStorage (`cc_token`), 30-day expiry
- **Backend routes**: `/api/auth/register`, `/api/auth/login`, `/api/auth/google`, `/api/auth/me`, `/api/auth/profile`
- **Google Sign-In**: via Google Identity Services SDK (GSI), sends credential to `/api/auth/google`
- **Email/Password**: bcryptjs for password hashing, form-based registration
- **Shopify Sync**: On registration/login, user is automatically synced as Shopify customer (creates if not exists)
- **Auth Context**: `client/src/lib/auth.tsx` - AuthProvider wraps entire app, provides `useAuth()` hook
- **User fields**: id, email, name, passwordHash, googleId, authProvider, avatarUrl, shopifyCustomerId, plan, status, credits, totalGenerations, lastLoginAt, createdAt
- **Env vars needed for Google Sign-In**: `GOOGLE_CLIENT_ID` (server) + `VITE_GOOGLE_CLIENT_ID` (frontend)

## Database Tables
- `users`, `characters`, `generated_images`, `scripts`, `comic_pages`
- `app_users` - Platform users (email, name, passwordHash, googleId, authProvider, avatarUrl, shopifyCustomerId, plan, status, credits, totalGenerations, lastLoginAt)
- `service_limits` - Per-plan quotas (planName, serviceName, maxQuantity, enabled)
- `subscription_plans` - Plans (name, displayName, priceMonthly/Yearly, features jsonb, limits, badgeColor)
- `conversations`, `messages` - Gemini chat

## Frontend Routes
- `/` - Hub (hero carousel, feature cards, stats, CTA)
- `/story-weaver` - Story/comic/cover generation wizard
- `/forge-3d` - 3D model generation (Tripo3D wizard + manual)
- `/video` - Video creation (AI director + progress bars)
- `/voice` - Voice studio (ElevenLabs TTS, dark theme, preview player)
- `/personajes` - Character gallery
- `/crear-personaje` - Character creation (AI or manual)
- `/mis-imagenes` - Image gallery
- `/mis-videos` - Video gallery
- `/mis-voces` - Voice gallery
- `/tienda` - User-facing store (plans, credits slider, service catalog)
- `/admin` - Admin dashboard (sidebar: Dashboard, Users, Plans, Payments, Shopify, IA Economist, Settings)
- `/login` - Login page (Google Sign-In + email/password)

## Credit System (Fair Pricing)
- **FREE**: AI chat (Gemini), script generation, character text descriptions, Gemini analysis, economist
- **PAID** (credit costs): Image generation = 5cr, Cover = 5cr, Comic page = 5cr, Character w/ image = 5cr, 3D model = 10cr, 3D from image = 10cr, 3D export = 2cr, Voice = 3cr, Video = 8cr, Gallery batch = 15cr, Manus gallery = 15cr
- **Credit packs (Tienda)**: Starter 100cr = €5, Creator 500cr = €22.50, Studio 1000cr = €40
- **Superuser** (sadiagiljoan@gmail.com): bypasses all credit checks, unlimited access, sees "Unlimited" badge
- Admin Panel only visible to superuser in user dropdown menu (hidden from all other users)

## Header Navigation
All visible on desktop (xl+): Inicio | Portadas & Guiones | Vídeo/Cortos | Modelos 3D | Voces IA | Crear Personaje | Tienda | Creaciones (dropdown). Admin Panel accessible only to superuser via user dropdown menu. Mobile hamburger includes all items except admin. User menu shows real name/avatar/plan from auth context.

## Admin Dashboard
- **Sidebar navigation**: Dashboard, Users, Plans, Payments, Shopify, IA Economist, Settings
- **Dashboard**: Stats cards (Users, Subscriptions, Files, Revenue), User Distribution chart, Recent Transactions
- **Plans**: Plan cards with features, advanced editor dialog with module toggles (AI Comics/Videos/Animated Shorts/3D/Voice), Live Plan Summary panel with cost estimates
- **Payments**: Revenue stats, orders table from Shopify
- **Shopify**: Products grid, orders count, customers count
- **IA Economist**: AI-powered market/pricing advisor (Gemini primary)
- **Settings**: Service limits per plan
- **Price fields**: type="text" inputMode="decimal" (NOT type="number")

## Tienda (User Store)
- Credit balance badge with progress bar
- 3 plan cards: Free ($0), Pro ($14.99 "Most Popular"), Enterprise (Contact Sales)
- Credits slider 100-5000+ with dynamic pricing
- Preset packs: Starter (100cr €5), Creator (500cr €22.50), Studio (1000cr €40)
- Services catalog: 4 cards (3D Printing, Videogames, Cinema, Custom Comics) with /services/ images

## AI Cost Strategy
- **Text (FREE)**: geminiChat PRIMARY for scripts, character descriptions, comic scene descriptions, gallery prompts, economist analysis. manusChat as fallback.
- **Images (PAID)**: manusGenerateImage (DALL-E 3 HD) for portraits, covers, comic panels, gallery images. No free alternative.

## Unified Platform Strategy
- **3 connected systems**: This Replit app (future Android APK) + Shopify web store + GitHub theme
- **User sync**: All platforms share the same user via email. App creates Shopify customers automatically.
- **Purchase sync**: Shopify Checkout for web purchases, Stripe for in-app purchases (Stripe pending setup)
- **Data flow**: App PostgreSQL DB is source of truth. Shopify syncs via Admin API. Stripe payments (future) create records in both.

## Key Files
- `shared/schema.ts` - Drizzle schema (includes auth schemas: registerSchema, loginSchema, googleAuthSchema)
- `server/routes.ts` - All API routes (auth + CRUD + AI + Shopify + Google)
- `server/auth.ts` - Authentication module (JWT, bcrypt, Google OAuth, token management)
- `server/storage.ts` - DatabaseStorage (includes getAppUserByEmail, getAppUserByGoogleId)
- `server/manus-ai.ts` - Manus/OpenAI Direct (DALL-E 3 HD + GPT-4o)
- `server/gemini.ts` - Gemini AI client
- `server/shopify.ts` - Shopify REST API client (includes syncUserToShopify, createCustomer, findCustomerByEmail)
- `server/tripo3d.ts` - Tripo3D API
- `server/elevenlabs.ts` - ElevenLabs API
- `client/src/App.tsx` - Main app with routing, header nav, AuthProvider wrapper
- `client/src/lib/auth.tsx` - Auth context (AuthProvider, useAuth hook)
- `client/src/pages/login.tsx` - Login page (Google + email/password)
- `client/src/pages/admin-dashboard.tsx` - Admin dashboard (sidebar layout)
- `client/src/pages/tienda.tsx` - User-facing store

## PWA Configuration (Google Play Store Ready)
- `client/public/manifest.json` - Full PWA manifest (standalone, dark theme, Spanish, shortcuts, screenshots)
- `client/public/sw.js` - Service worker (cache-first for static, network-first for API, offline fallback)
- `client/index.html` - PWA meta tags, apple-mobile-web-app-capable, theme-color, SW registration
- `client/public/.well-known/assetlinks.json` - Digital Asset Links for TWA (package: es.comiccrafter.app)
- Lang set to `es`, viewport allows user scaling
- **Icons**: All sizes in `client/public/icons/` (48, 72, 96, 128, 144, 192, 384, 512) + maskable (192, 512)
- **Play Store Assets**: `client/public/icons/play-store-icon-512.png`, `client/public/gallery/feature-graphic-play.png` (1024x500)

## Google Play Store (TWA)
- Package name: `es.comiccrafter.app`
- TWA project files in `twa-project/` (AndroidManifest.xml, build.gradle, strings.xml, styles.xml)
- Use PWABuilder (https://www.pwabuilder.com/) to generate APK/AAB from the published URL (recommended)
- Or build locally with Bubblewrap CLI (see `twa-project/BUILD_INSTRUCTIONS.md`)
- After generating APK, get SHA256 fingerprint and update `.well-known/assetlinks.json`
- Feature graphic: `/gallery/feature-graphic-play.png` (1024x500)
- App icon for upload: `/icons/play-store-icon-512.png` (512x512)
- Screenshots: `/gallery/screenshot-create.png` (phone), `/gallery/screenshot-3d.png` (phone), `/gallery/comiccrafter-showcase.png` (tablet/wide)

## ZIP Export
- `POST /api/export/zip` endpoint with archiver package
- Accepts `{ type: "images"|"characters"|"scripts"|"all", ids?: number[] }`
- Behind paywall: requires Pro or VIP plan (or superuser)
- Frontend export buttons on mis-imagenes.tsx and personajes.tsx
- Downloads as `comiccrafter-{type}-{timestamp}.zip`
- ZIP contains: images/*, characters/*/info.txt + photos, scripts/*.txt

## Static Assets
- `client/public/logo-app.png` - App logo (original high-res)
- `client/public/icons/` - All icon sizes for PWA + Play Store
- `client/public/services/` - Service images (3d-printing.png, custom-comics.png, movies.png, videogames.png, portfolio.png)
- `client/public/gallery/` - 16+ showcase images (banners, covers, screenshots, features, feature-graphic-play)
- `client/src/assets/images/logo.png` - Logo for watermark

## Internationalization (i18n)
- **Languages**: Spanish (ES, default/fallback), English (EN), Japanese (JA), French (FR)
- **Library**: i18next + react-i18next + i18next-browser-languagedetector
- **Config**: `client/src/i18n/index.ts` — loaded in `client/src/main.tsx`
- **Translation files**: `client/src/i18n/{es,en,ja,fr}.json` — 636 keys each (full parity)
- **Language selector**: Dropdown in App.tsx header, persists to localStorage (`cc_language`)
- **Namespaces**: nav, hub, login, storyWeaver, forge3d, voice, video, character, gallery, videos, voices, characters, tienda, credits, legal, admin, notFound, common
- **Usage**: `const { t } = useTranslation()` in every component, `t("namespace.key")` for all UI strings
- **Fallback**: Missing keys fall back to ES (fallbackLng: "es")
- All pages fully converted: App.tsx, hub, login, tienda, legal, story-weaver, forge-3d, voice-studio, crear-video, crear-personaje, mis-imagenes, mis-videos, mis-voces, personajes, admin-dashboard, not-found
- credits.tsx uses `useTranslation` for service labels, badge text, and paywall dialog

## Important Notes
- `queryClient` import MUST be from `./lib/queryClient`
- Never nest `<Link><a>` (wouter)
- Google clients must NEVER be cached
- App name: "Comic Crafter" (with space) everywhere
- Service limits auto-seeded on startup (free/pro/vip)
- Auth token stored in localStorage as `cc_token` (also keeps `isLogged` for backward compat)
- Shopify token (SHOPIFY_ACCESS_TOKEN) needs to start with `shpat_` for modern Shopify apps
