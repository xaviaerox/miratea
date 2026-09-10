# Changelog — MIRATEA by Solutech

All notable changes to the **MIRATEA** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.2] - 2026-09-09 (Emotional Worlds Sensory Atmosphere & Accessibility Release)

### Changed & Improved
- **Preservación del Fondo Sensorial Cálido (`#FAF9F7`)**:
  - Eliminadas las variantes oscuras agresivas (`dark:from-*-950`, `dark:via-*-950`) en `src/components/worlds/worldThemes.ts` que se activaban de forma involuntaria cuando el sistema o navegador tenía activado el modo oscuro (`prefers-color-scheme: dark`), rompiendo la interfaz y la legibilidad.
  - El contenedor principal de `/home` mantiene de forma constante y serena el fondo cálido `#FAF9F7` (`bg-stone-50`) con contraste tipográfico AAA en el saludo, nombre del menor y textos de acompañamiento.
- **Nueva Capa de Atmósfera Ambiental (`WorldAtmosphere`)**:
  - Incorporado el componente modular `WorldAtmosphere.tsx` con un aura superior difusa y sutil (`auraGradient`) que tiñe delicadamente la zona del terrario sin sobrecargar.
  - Integradas partículas flotantes temáticas (burbujas en el Lago de la Calma, pétalos en el Valle de los Hábitos, hojas y luciérnagas en el Bosque de la Autonomía, chispas estelares en las Montañas del Esfuerzo y corazones en el Reino Social) con baja opacidad (25%-40%) y `pointer-events-none`.
  - Soporte de accesibilidad estricto: en modo "Menos Efectos y Animaciones" (`silentMode`) o con `prefers-reduced-motion`, todas las partículas y animaciones quedan desactivadas de inmediato.
- **Píldoras y Controles de Interfaz Pulidos**:
  - Rediseñado el botón selector de mundo y la tarjeta de progreso para garantizar tipografía nítida y contraste perfecto sobre el lienzo cálido.
  - Ajustados los botones de acción inferior ("Recuerdos", "Cuento", "Hablar") con colores pastel armónicos de alto contraste.
- **Gobernanza PWA**:
  - Actualizado `CACHE_NAME` a `miratea-v1.3.2` en `public/sw.js`.
  - Incremento de versión canónica a `1.3.2` en `package.json`.
- **Seguridad & Blindaje de Confidencialidad**:
  - Blindaje estricto en `.gitignore` bloqueando el directorio `/internal/`, formatos ofimáticos confidenciales (`*.docx`, `*.pptx`, `*.xlsx`), PDFs de trabajo fuera de activos web públicos y registros privados de validación comercial.
- **Higiene Git & Consistencia Multi-dispositivo**:
  - Des-rastreo y eliminación de binarios de caché Python (`.pyc`) y resolución limpia de marcadores de merge en `.gitignore` y `PROJECT_CONTEXT.md`.
  - Incorporación de `.gitattributes` para forzar normalización de saltos de línea LF y consistencia binaria multiplataforma entre ordenadores.
  - Exclusión sistemática de carpetas de configuración de IDE (`.vscode/`, `.idea/`).
- **Infraestructura CI/CD en GitHub Pages**:
  - Concesión explícita de permisos `id-token: write` y `pages: write` a nivel de job en `.github/workflows/deploy.yml` para garantizar la autorización OIDC en el despliegue automático de GitHub Pages.
- **Validación Regional e Institucional (Murcia)**:
  - Ejecución y archivado de la campaña de validación y outreach institucional a 20 asociaciones clave de neurodivergencia en la Región de Murcia (`commercial-validation/OUTREACH_ASOCIACIONES_MURCIA.md` y `commercial-validation/outreach_log.json`).

---

## [1.3.1] - 2026-09-08 (Custom Domain & Production Architecture Release)

### Added
- **Dominio Propio Canónico (`miratea.es`)**:
  - Incorporación del archivo `public/CNAME` con `miratea.es` para persistencia nativa y automática en GitHub Pages durante el pipeline de despliegue (`output: 'export'`).
  - Verificación y enlace DNS con registros A/AAAA para el dominio raíz `miratea.es` y registro CNAME para `www.miratea.es` hacia `xaviaerox.github.io`.

### Changed & Maintained
- **Migración de `basePath` a la Raíz (`/`)**:
  - Actualizado `next.config.ts` para que `basePath` utilice por defecto la raíz (`''`), permitiendo URLs limpias (`/login`, `/dashboard`, `/ayuda`, `/home`) sin el prefijo `/miratea`.
  - Actualización de metadatos SEO y OpenGraph (`metadataBase: https://miratea.es`) y tarjetas sociales de Twitter en `src/app/layout.tsx`.
  - Adaptación de rutas de iconos y favicon en `src/app/layout.tsx` y `src/app/manifest.ts` (`start_url: '/'`, `scope: '/'`).
  - Registro de Service Worker unificado en `/sw.js` en `src/components/PwaUpdater.tsx`.
  - Actualización de `CACHE_NAME` a `miratea-v1.3.1` en `public/sw.js` con cacheo determinista de `icon.svg` y `manifest.webmanifest`.
  - Normalización de rutas de activos en `BrandLogos.tsx` y URLs de retorno en autenticación parental (`reset-pin` y `ConfirmParentPinModal`).
  - Incremento de versión canónica a `1.3.1` en `package.json`.

---

## [1.3.0] - 2026-09-05 (Family Guide & Knowledge Architecture Release)

### Added
- **Centro de Ayuda y Guía Completa de la A a la Z (`/ayuda`, `/guide`)**:
  - Nueva página pública y sensorial (`src/app/ayuda/page.tsx`) estructurada en 11 áreas temáticas: Filosofía neurodivergente sin punición, Registro parental paso a paso, Familias e invitación de hijos (códigos de 8 caracteres), El compañero Lumi inmutable, Rutinas visuales amables, Desintegrador de metas con IA y Zero-PII, Moneda Sparks ✦ y catálogo de premios, Rincón de Calma a 432Hz y Box Breathing 4-4-4-4, Seguridad con PIN parental de 4 dígitos, Accesibilidad adaptada (OpenDyslexic y Menos Efectos) y Preguntas Frecuentes.
  - Redirección automática transparente desde `/guide` y `/miratea/guide` a `/ayuda` en Next.js App Router (`src/app/guide/page.tsx`) y configuración `next.config.ts`.
- **Componentes Modulares de Ayuda (`src/components/help/`)**:
  - `GuideNav.tsx`: Selector de categorías interactivo con chips/píldoras y scroll accesible.
  - `GuideStepCard.tsx`: Tarjeta ilustrada de pasos secuenciales distinguiendo roles ("Acción del Adulto", "Acción del Menor", "En Familia").
  - `GuideFaq.tsx`: Acordeón interactivo de preguntas frecuentes filtrable por categoría.
- **Puntos de Integración del Icono y Enlaces de Ayuda**:
  - Cabecera del panel parental (`src/app/dashboard/layout.tsx`): Botón accesible con icono `HelpCircle` de Lucide y enlace directo a la guía.
  - Pantalla de Familia (`src/app/dashboard/family/page.tsx`): Banner didáctico explicando cómo generar códigos para hijos e invitaciones.
  - Pestaña de Ajustes (`Tab 5 / profile` en `src/app/home/page.tsx`): Tarjeta destacada "Guía de MIRATEA (de la A a la Z)".
  - Cabecera de Landing (`src/app/landing/page.tsx`): Enlace "Guía para Familias".
  - Formularios de Autenticación (`/login`, `/signup`, `/join`): Enlaces de orientación contextual para nuevos tutores.
  - Pie de página legal (`src/components/ui/LegalFooter.tsx`): Enlace unificado a la Guía para Familias.
- **Suite de Pruebas Unitarias (`src/app/ayuda/__tests__/ayudaLogic.test.ts`)**:
  - 6 tests unitarios verificando la presencia de categorías, cumplimiento inmutable de denominación Sparks (0 menciones a "chispas"), filosofía sin punición, código de 8 caracteres y política Zero-PII (total suite: 155/155 tests pasando).

### Changed & Maintained
- **Versionado SemVer & Caché PWA**: Incremento de versión canónica a `1.3.0` en `package.json` y actualización de `CACHE_NAME` a `miratea-v1.3.0` en `public/sw.js`.

---

## [1.2.0] - 2026-09-05 (Decoupled Analytics & Observability Architecture Release)

### Added
- **Decoupled Analytics & Observability Infrastructure (`src/infrastructure/analytics/`)**: Centralized facade (`analytics.track`, `analytics.identify`, `analytics.page`, `analytics.error`, `analytics.message`, `analytics.flush`) isolating transport providers from business logic and preventing direct vendor lock-in.
- **Strict Anti-PII & Privacy Guard (`privacy.guard.ts`)**: Enforced Zero-PII sanitization blocking parent/child names, emails, phones, national IDs, and clinical diagnostics (TEA/TDAH) in event payloads and error stack traces.
- **Provider Architecture (`providers/`)**:
  - `SupabaseAnalyticsProvider`: Persistent product analytics with local storage queue (max 100 events), offline resilience, and automatic flush on reconnection.
  - `SentryTelemetryProvider`: Sentry-compatible technical observability with sanitized `beforeSend` scrubbing and in-memory report buffer for static/SSR environments.
  - `PostHogAnalyticsProvider`: Pluggable, decoupled product analytics adapter activated only when environment keys are provided.
- **Sensory-Adapted Error Boundaries (`src/app/error.tsx`, `src/app/global-error.tsx`)**: Calming, neurodiversity-affirmative error boundaries (`#FAF9F7`) in Next.js 16 App Router routing errors to `analytics.error()` without disrupting user experience or triggering sensory overload.
- **Dedicated Test Suite (`src/infrastructure/analytics/__tests__/analytics.test.ts`)**: 11 automated unit tests verifying Zero-PII blocking, URL sanitization, fail-safe non-blocking execution, and offline queueing (total tests: 149/149).

### Fixed & AI Migration
- **Groq Deprecated Model Migration (`openai/gpt-oss-20b`)**: Replaced decommissioned models `llama-3.1-8b-instant` and `llama-3.3-70b-versatile` (which returned HTTP 404 model_not_found) with the active high-speed reasoning model `openai/gpt-oss-20b` across API routes (`/api/companion/chat`, `/api/decompose`) and Supabase Edge Functions (`companion-chat`, `decompose`).
- **AI Streaming & Reasoning Tuning**: Configured `reasoning_effort: 'low'` and calibrated `max_tokens` to `500` to prevent truncation during token generation while preserving safe Zero-PII streaming filtering (reasoning tokens filtered before child exposure).
- **Environment Alignment & Key Verification**: Synchronized and verified production `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_MAX_TOKENS`, and `GROQ_REASONING_EFFORT` across `.env.local` and `.env.local.example`.

### Refactored & Enhanced
- **Legacy Compatibility Bridges (`tracker.ts`, `telemetry.ts`, `errorTracker.ts`, `useAnalytics.ts`)**: Transparent re-exports maintaining 100% backward compatibility for existing components and tests.
- **PWA Service Worker Cache Refresh (`public/sw.js`)**: Bumped `CACHE_NAME` to `miratea-v1.2.0`.

---

## [1.1.4] - 2026-08-31 (OpenGraph, Favicon & SEO Optimization Release)

### Fixed & Optimized
- **Official MIRATEA Beacon Star Favicon & App Icons Unification (`public/favicon.ico`, `src/app/favicon.ico`, `public/icon-192x192.png`, `public/icon-512x512.png`)**: Replaced outdated legacy assets and placeholder favicons with clean, crisp multi-resolution icons rendered directly from the canonical vector [`public/icon.svg`](file:///c:/Users/Xaviaerox/Documents/GitHub/mira-app/public/icon.svg) (16x16, 32x32, 48x48, 192x192, 512x512).
- **OpenGraph & Twitter Card Image Dimensions (`public/mira-banner.jpg`)**: Resized and optimized hero banner to exactly `1200×630` px (1.91:1 standard aspect ratio), eliminating social crawler aspect ratio warnings, mobile card letterboxing, and unwanted cropping while compressing asset size from 777 KB to 152 KB.
- **Search Engine Snippet Title Optimization (`src/app/layout.tsx`)**: Shortened root `<title>` from 71 characters to 48 characters (`MIRATEA 🌟 — Autonomía y Autorregulación Familiar`), staying strictly under Google's ~60 character truncation threshold for clean, complete display on SERP snippets across mobile and desktop.

---

## [1.1.3] - 2026-08-23 (Production Audit & Compliance Hardening Release)

### Fixed & Compliance
- **Privacy Policy Statement Correction (`/privacy`)**: Replaced imprecise text claiming local-only storage with explicit statement explaining `PiiSanitizer` anonymization prior to transmission to external LLM providers.
- **Brandbook Values Alignment (`/brandbook`)**: Updated "Confianza y Seguridad" value description to specify pre-anonymization prior to external processing.
- **OpenGraph Metadata Social Card (`src/app/layout.tsx`)**: Configured `metadataBase` and absolute production URL `https://xaviaerox.github.io/miratea/mira-banner.jpg` for `openGraph` and `twitter` cards.

### Added
- **Verifiable Parent Legal Consent Checkbox (`src/app/(auth)/signup/page.tsx`)**: Added mandatory, non-prechecked checkbox for parent age majority and legal guardianship confirmation.
- **Consent Timestamp & DB Tracking (`IAuthAdapter`, `StaticAuthAdapter`, `SupabaseAuthAdapter`, `profiles`)**: Persisted `consent_given` (boolean) and `consent_timestamp` (ISO timestamp) in profiles table, added Supabase migration (`20260823_add_parent_consent.sql`), and added unit tests in `phase1.test.ts`.

---

## [1.1.2] - 2026-08-23 (Commercial Validation Hardening Release)

### Security & Anti-PII
- **Centralized Privacy-First Analytics Architecture (`src/lib/analytics/tracker.ts`)**: Built a strictly typed analytics engine with `EventPayloadMap`, two-tier Anti-PII validator blocking names, emails, phones, national IDs, and clinical text, local `localStorage` queue (max 100 events), deduplication by event UUID, network recovery flush, and Supabase `analytics_events` transport.
- **Adversarial RLS Security Suite (`rlsSecurityAdversarial.test.ts`)**: Added 63 security tests proving A→A ALLOW, A→B DENY, and B→A DENY for SELECT, INSERT, UPDATE, and DELETE operations across all domain tables.

### Commercial & Data Minimization
- **Early Family Lead Persistence & Data Minimization (`src/app/landing/page.tsx`)**: Removed `neurodivergence` health data field from lead submission (GDPR Art. 9 compliance), adopted `childAgeRange`, added an explicit legal privacy notice consent checkbox linking to `/privacy` and `/terms`, and enabled real Supabase `early_family_leads` persistence.
- **Feedback Widget Real Persistence (`src/components/feedback/FeedbackWidget.tsx`)**: Enabled direct Supabase `feedback_responses` table persistence for child sentiment and parent D30 evaluation with semantically correct event names (`child_sentiment_submitted`, `parent_value_evaluated`).
- **Activation Instrumentation (`src/components/onboarding/OnboardingGuide.tsx`)**: Instrument `onboarding_started`, `onboarding_step_completed`, `activation_completed`, and `onboarding_dismissed` events.

---

## [1.1.1] - 2026-08-21 (Demo Mode & API Key Robustness Release)

### Fixed
- **Dynamic Delegating Adapters**: Implemented `Delegating*Adapter` classes for all 9 core domain modules in `src/lib/adapters.ts`, eliminating state freezes from module-level singleton instantiations and allowing seamless zero-latency switches between Supabase and Static Demo modes.
- **Demo Mode 1-Click Activation**: Enhanced `signIn` in `DelegatingAuthAdapter` and login handlers to automatically set `mira_demo_mode` in `localStorage` when demo credentials (`child@demo.app`, `parent@mira.app`, `demo`) are provided, preventing erroneous 400 Bad Request calls to Supabase.
- **Supabase 400 Bad Request Elimination**: Replaced static `DATA_SOURCE === 'supabase'` checks across components (`SparkProvider`, `ChildDetailClient`, `dashboard/page`, `rewards/page`, `CustomizationModal`, `ChildFeedbackModal`, `MemoryEngine`, `VectorMemoryEngine`, `decomposeAI`) with dynamic `isUseSupabase()`, stopping Realtime channels and RPC invocations when in demo mode or when Supabase keys are placeholder values.
- **Sensory Audio Synthesis for Breathing (`useSensoryAudio` & `CalmModeModal`)**: Integrated phase-aware 432Hz harmonic Web Audio synthesis into `CalmModeModal.tsx` and `CalmCornerModal.tsx`, added user-gesture AudioContext resume handlers on pointer/click events to overcome browser autoplay restrictions, and added a visual Mute/Unmute audio control toggle.

---

## [1.1.0] - 2026-08-21 (Commercial Product Release)

### Added
- **Commercialization Blueprint & Validation Kit Integration**: Embedded the complete operational commercial validation framework in `commercial-validation/` (`VALIDATION_PLAN.md`, `HYPOTHESES.md`, `METRICS.md`, `EXPERIMENTS.md`, `DECISIONS.md`, `CUSTOMER_INSIGHTS.md`, `INTERVIEWS/`, `COMMERCIAL/`).
- **Commercial Landing Page (`/landing`)**: Built high-converting public landing page featuring "Menos recordatorios. Más autonomía.", three commercial pillars (Lumi Companion, Adaptive Routines, Sparks ✦), value cycle infographic, dual benefits, trust stack, pricing comparison, Early Families modal, and FAQ.
- **Legal & Compliance Infrastructure**: Published `/privacy`, `/terms`, `/cookies` pages and integrated `LegalFooter.tsx` with medical disclaimer and GDPR/COPPA compliance notices.
- **Product Analytics Telemetry (`src/lib/analytics/tracker.ts` & `useAnalytics.ts`)**: Built privacy-first event tracking for user activation, routines, goals, sparks, calm corner, and conversion funnels.
- **In-App Onboarding & Value Loop Guide (`OnboardingGuide.tsx`)**: Added <10 minute activation checklist for new parent & child profiles.
- **In-App Feedback & Value Survey Widget (`FeedbackWidget.tsx`)**: Created child sentiment check-in and parent D30 value evaluation forms.
- **Supabase Commercial Migration (`20260821_commercial_validation_kit.sql`)**: Created tables for `analytics_events`, `early_family_leads`, and `feedback_responses` with RLS policies.

---

## [1.0.0] - 2026-08-18 (Commercial Release Gold v1.0)

### Added
- **Centralized Settings & Accessibility Panel (`Tab 5 / profile`)**: Integrated generic **Fuente de Lectura Adaptada (OpenDyslexic)** and **Menos Efectos y Animaciones** toggles directly into the Settings tab in `src/app/home/page.tsx`, storing state in `localStorage` (`mira_font`) and applying `data-font="dyslexic"` globally.
- **Dynamic Step Count Selector in Adventure Proposals (`GoalProposalModal`)**: Added dynamic step count pills (`2..6` steps) and a `+ Añadir otro paso` button allowing children and parents to dynamically expand or trim microtasks when proposing new goals.
- **Dynamic AI Decomposition**: Updated `decomposeGoalWithAI` in `src/lib/goals/decomposeAI.ts` to accept a dynamic `targetCount` parameter and generate the exact number of steps requested by the user.

### Changed
- **Sparks Terminology Standardization**: Enforced the official system currency name **Sparks** (or **Sparks ✦**) across all UI components, modals, catalog cards, companion chat responses, and static adapters, completely eliminating the legacy term "chispas".
- **Header Cleanliness**: Removed the top-right "Menos efectos" toggle button from the main header in `src/app/home/page.tsx`, leaving a clean, uncluttered top bar with avatar, greeting, rewards button, and `SparkBadge`.
- **Breathing Modal Simplification**: Removed the duplicate font toggle button from `CalmModeModal.tsx` in favor of the unified setting in the Settings tab.
- **Login Privacy Protection**: Removed the public Brandbook link from `src/app/(auth)/login/page.tsx` to keep internal brand assets restricted from client user access.

---

## [1.3.2] - 2026-07-31

### Added
- **Parent 1-Click Reward Approval Modal (`RewardsDashboardPage`)**: Implemented an interactive `ApprovalModal` on `/dashboard/rewards` allowing parents to review child proposals, set/edit the exact spark cost in 1 click, save to the catalog, and deduct sparks immediately without needing to delete and recreate rewards.
- **Child Suggested Cost Field**: Updated `useRewardRequests.ts` and the "Proponer un premio" modal in `home/page.tsx` to allow children to optionally suggest a spark amount while clearly explaining that parents set the final cost.

### Fixed
- **Fixed Reward Cost Lock**: Eliminated default 10-spark fallback locking on pending proposals, preventing parent frustration and unnecessary reward deletion.

---

## [1.3.1] - 2026-07-30

### Added
- **Sensory Audio Autoplay & Harmonic Oscillator (`useSensoryAudio`)**: Integrated user-gesture initialization (`initAudio()`), raised peak gain to `0.25`, added a 216Hz sub-octave harmonic to 432Hz sine synthesis, and added a completion chime in `CalmCornerModal.tsx`.

### Fixed
- **Autoplay Policy Audio Blocking**: Resolved Chrome/Edge/Safari browser autoplay policy blocking by binding `AudioContext` resume calls directly to user click gestures upon opening the Calm Corner modal.

---

## [1.3.0] - 2026-07-31

### Added
- **Playwright E2E Test Suite Expansion**: Added `calm_corner.spec.ts` and `emotional_checkin.spec.ts` to test full user journeys for guided breathing and emotional check-in.
- **Sensory & Reduced Motion Controls**: Enhanced accessible sensory response options for children with hyper-sensory visual profiles.

### Fixed
- **CI/CD Prepare & package-lock.json Fix**: Updated `package-lock.json` with `husky` & `lint-staged` dependencies and implemented cross-platform Node.js CI-guard script `"prepare": "node -e \"if (!process.env.CI) ...\""` in `package.json` to guarantee failure-proof `npm ci` runs across Linux/Windows.

---

## [1.2.0] - 2026-07-31

### Added
- **Modular Domain Stores**: Extracted state domain logic into `routineStore.ts` and `goalStore.ts` to unburden `useHomeState.ts` and prevent unnecessary UI re-evaluations.
- **Enhanced PII NER Patterns**: Upgraded `PiiSanitizer.ts` with Named Entity Recognition patterns for Spanish DNI/NIE/SSN (`[NATIONAL_ID]`) and Dates of Birth (`[DATE_OF_BIRTH]`).
- **WAI-ARIA Accessibility**: Integrated `Escape` key handling and `role="dialog"` modal accessibility in `CalmCornerModal.tsx`.

---

## [1.1.0] - 2026-07-31

### Added
- **Content Security Policy (CSP)**: Added strict CSP headers in `next.config.ts` protecting against XSS and unauthorized script injection.
- **Automated Pre-Commit DX**: Configured `husky` prepare script and `lint-staged` execution in `package.json`.
- **GitHub Contribution Templates**: Added `.github/ISSUE_TEMPLATE/bug_report.md`, `feature_request.md`, and `.github/PULL_REQUEST_TEMPLATE.md`.

---

## [1.0.0] - 2026-07-23

### Added
- **Real-Time LLM Streaming (SSE)**: Native streaming proxy for Groq, Gemini, and Anthropic APIs achieving ~300ms Time-to-First-Token in `/api/companion/chat`.
- **Accessibility & Sensory Comfort (`prefers-reduced-motion`)**: Reactive hook `useReducedMotion.ts` integrated into `WorldAmbientVisuals.tsx` to automatically pause keyframe animations and continuous particles for users with vestibular sensitivities.
- **RAG Semantic Memory (`pgvector`)**: Supabase Postgres migration `20260727000000_companion_vector_memories.sql` with HNSW vector index and `match_companion_memories` RPC search for contextual memory retrieval in `MemoryEngine.ts`.
- **Voice Assistant STT (`useSpeechRecognition`)**: Native Web Speech API voice input hook and 🎙️ dictation button in `CompanionChatModal.tsx` for hands-free child interaction.
- **Therapeutic AI Micro-Stories**: Engine `StoryGenerator.ts` and interactive reader `StoryReaderModal.tsx` to generate personalized 3-chapter bedtime stories based on weekly routine achievements and value milestones.
- **PWA Service Worker (`public/sw.js`)**: Network-first with cache-fallback strategy for PWA offline shell capability.
- **PDF Emotional Evolution Report**: Client-side PDF generation engine using `jspdf` for printing child emotional check-in trends and value growth.
- **GitHub Actions CI (`ci.yml`)**: Continuous integration workflow validating lint, TypeScript typecheck, and Vitest test suite on every PR and main commit.
- **Security Policies (`SECURITY.md`)**: Comprehensive COPPA / GDPR child privacy policy, PII obfuscation specification, and vulnerability disclosure SLA.

### Refactored
- **Home Page Modularization**: Extracted state orchestration, Supabase realtime channels (`spark_ledger`, `child_badges`), and side-effects from `src/app/home/page.tsx` into clean custom hook `src/hooks/useHomeState.ts`.
- **Distributed Rate Limiting**: Upgraded `RateLimiter.ts` to support Upstash Redis REST pipelines in Serverless (Vercel) environments with zero-config in-memory fallback for local development.

### Fixed
- Fixed memory leakage in `useReducedMotion` and `useSpeechRecognition` hooks.
- Eliminated all ESLint warnings and errors across the codebase (0 errors, 0 warnings).
- Resolved security definer search path vulnerabilities in Supabase migrations (`SET search_path = public, extensions, pg_temp`).

### Security
- COPPA & GDPR compliant PII sanitization middleware (`PiiSanitizer.ts`).
- Enforced Row Level Security (RLS) across all Supabase tables (`companion_memories`, `child_badges`, `companion_embeddings`).
