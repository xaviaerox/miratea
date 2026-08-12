# Changelog — MIRATEA by Solutech

All notable changes to the **MIRATEA** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.4.0] - 2026-08-12

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
