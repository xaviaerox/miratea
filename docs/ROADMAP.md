# MIRATEA — Product Roadmap & Execution Log

---

## Completed Milestones (Phases 1 — 7)

### Phase 1: Auth + Family Infrastructure
- `families`, `profiles`, `family_invites` schema + RLS.
- `create_family_with_parent()` and `join_family_with_invite()` DB functions.
- Dual-Adapter architecture for Auth & Family (`IAuthAdapter`, `IFamilyAdapter`).
- `AuthProvider` & `FamilyProvider` context hooks.

### Phase 2: Routines & Progress Tracking
- `routines`, `routine_tasks`, `routine_completions` schema + RLS.
- `spark_ledger` & `award_sparks()` SECURITY DEFINER database triggers.
- `IRoutineAdapter` (Static & Supabase implementations).

### Phase 3: Companion Lumi Engine
- `companions`, `companion_interactions` schema + RLS.
- Inmutable stage progression (Semilla → Brote → Lumi Aurora).
- `CompanionEngine.ts` & `DialogueBank.ts` neurodiversity-affirming responses.

### Phase 4: Goals & AI Microtask Decomposition
- `goals`, `goal_microtasks` schema + RLS.
- `SupabaseGoalsAdapter` & `StaticGoalsAdapter`.
- `decomposeGoalWithAI` engine with PII sanitization.
- **Dynamic Step Count Selector (`GoalProposalModal`)**: Dynamic 2..6 step count selector and `+ Añadir otro paso` dynamic expansion button.

### Phase 5: Emotional Tracking & Therapeutic Reports
- `emotional_checkins` schema & `on_emotional_checkin()` triggers.
- Client-side PDF generation engine (`jspdf`) for therapeutic export.
- `EmotionalProvider` context hook.

### Phase 6: Production Hardening & PWA
- `offline_queue` IndexedDB/localStorage queue & drain logic.
- PWA Service Worker (`public/sw.js`).
- 50/50 unit tests passed across Vitest suite.

### Phase 7: Rewards Approval, Accessibility & Sparks Standardization (v1.4.0)
- **1-Click Reward Approval Modal**: Interactive parent approval on `/dashboard/rewards` allowing parents to review child proposals and edit Spark costs directly.
- **Autoplay Safe Web Audio API**: User-gesture bound 432Hz fundamental + 216Hz sub-octave double oscillator sine synthesis with completion chime.
- **Centralized Accessibility Settings**: OpenDyslexic reading font and reduced motion ("Menos Efectos y Animaciones") toggles in Settings (`Tab 5 / profile`), keeping header clean.
- **Sparks ✦ Terminology Standardization**: Complete elimination of legacy term "chispas" in favor of official currency **Sparks** (or **Sparks ✦**).
- **Public Brandbook Protection**: Removal of public Brandbook link from login page to restrict internal brand assets.

---

## Future Expansion Roadmap

### 1. Multi-Device Realtime Sync Enhancements
- High-concurrency WebSockets channel optimization for real-time family tablet sync.

### 2. Clinical Analytics PDF Customization
- Customizable date-range filtering for PDF reports exported for occupational therapists.

### 3. Native PWA Push Reminders (Sensory Opt-In Only)
- Non-intrusive, customizable routine gentle reminders with explicit parental opt-in.

---

## Permanently Forbidden Mechanics

These will NEVER be implemented in MIRATEA:
- Streaks or consecutive days counters of any kind.
- Social comparison between children or public leaderboards.
- Companion stage regression or guilt messages ("I miss you").
- Random rewards, loot boxes, or ad-based monetization.
- Raw emotional data visible to third parties.
