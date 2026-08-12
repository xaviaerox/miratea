# MIRATEA — System Architecture & Technical Specifications

**Solutech · MIRATEA Platform Architecture**

---

## System Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                        MIRATEA PLATFORM                         │
│                                                                 │
│   Child View                        Parent Dashboard            │
│   ──────────────────────            ─────────────────────────   │
│   • Companion Lumi (ambient)        • Family members            │
│   • Today's routines                • Weekly emotional summary  │
│   • Active goal step                • Goal management           │
│   • Emotional check-in              • Sparks ✦ approvals        │
│   • Spark balance ✦                 • Routine creation          │
│   • Sensory Audio & Calm Corner     • Schedule configuration    │
│   • Centralized Settings (Tab 5)    • Professional PDF export   │
│                   │                           │                 │
│                   └───────────┬───────────────┘                 │
│                               │                                 │
│                    ┌──────────▼──────────────┐                  │
│                    │   Next.js App Layer     │                  │
│                    │   React Context Tree    │                  │
│                    │   Dual-Adapter Seam     │                  │
│                    └──────────┬──────────────┘                  │
│                               │                                 │
│              ┌────────────────▼────────────────┐                │
│              │           Supabase              │                │
│              │  PostgreSQL + Auth + Realtime   │                │
│              │  Row Level Security on all      │                │
│              │  DB triggers & RPC security     │                │
│              └─────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Provider Tree & State Architecture

Providers must be nested in this exact order. Each provider depends on those above it.

```tsx
<AuthProvider adapter={getAuthAdapter()}>
  <FamilyProvider adapter={getFamilyAdapter()}>
    <CompanionProvider adapter={getCompanionAdapter()}>
      <EmotionalProvider adapter={getEmotionalAdapter()}>
        <AppLayout>
          {children}
        </AppLayout>
      </EmotionalProvider>
    </CompanionProvider>
  </FamilyProvider>
</AuthProvider>
```

**Dependency Chain:**
- `AuthProvider` → provides `session`, `profile`, `family`
- `FamilyProvider` → reads from `useAuth()`, provides family members
- `CompanionProvider` → reads `profile.role` from `useAuth()`, child-only
- `EmotionalProvider` → reads `profile.id` from `useAuth()`

### Modular Sub-Stores (`src/lib/stores/`)
To prevent monolithic hook re-evaluations and optimize rendering performance, domain state is split into modular sub-stores:
- `routineStore.ts`: Manages visual routine completion state and scheduled intervals.
- `goalStore.ts`: Manages active adventures, microtasks progress, and dynamic step decomposition.

---

## Security & Sanitization Layer

### PII Protection (`PiiSanitizer.ts`)
Before any prompt or user input is sent to external LLMs (Groq, Gemini, Anthropic), `PiiSanitizer.ts` executes Named Entity Recognition (NER) and regex replacements:
- Child and family names → `[CHILD_NAME]`, `[FAMILY_NAME]`
- National IDs / DNI / SSN → `[NATIONAL_ID]`
- Birth dates → `[DATE_OF_BIRTH]`
- Address details → `[ADDRESS]`

Responses returned from external APIs are desanitized locally on device before being displayed.

### Sliding-Window Rate Limiting (`RateLimiter.ts`)
Serverless API endpoints (such as `/api/decompose` and `/api/companion/chat`) enforce sliding-window rate limiting (10 req/min per IP) powered by Redis REST pipelines with in-memory fallback for local dev.

---

## Dual-Adapter Pattern

Every domain module adheres to the Dual-Adapter seam:

```text
IXxxAdapter          ← Interface contract
StaticXxxAdapter     ← In-memory implementation (offline & demo)
SupabaseXxxAdapter   ← Production PostgreSQL implementation
```

Controlled by `NEXT_PUBLIC_DATA_SOURCE`:
- `static`: 1-click zero-config offline demo mode.
- `supabase`: Production PostgreSQL database with RLS.

Singletons are instantiated exclusively by `getRewardsAdapter()`, `getGoalsAdapter()`, `getRoutinesAdapter()`, and `getFamilyAdapter()`.

---

## Web Audio API & Sensory Engine (`useSensoryAudio.ts`)

- **Synthesis**: Pure Web Audio API sine wave generation (432Hz ambient fundamental + 216Hz sub-octave harmonic).
- **Gain Peak**: Capped at `0.25` for gentle, non-overwhelming auditory response.
- **Autoplay Handling**: AudioContext resume calls are strictly bound to explicit user gestures (`initAudio()`) to guarantee compliance with modern browser autoplay policies.
- **Completion Chime**: Ascending 3-tone harmonic chime triggered upon completing guided Box Breathing cycles.

---

## Security Model & Database Rules

### Row Level Security (RLS)
- Every PostgreSQL table has RLS enabled, enforcing isolation by `family_id`.
- Children can only write their own completions (`child_id = auth.uid()`).
- Parents can manage catalog items and review proposals within `family_id`.
- `spark_ledger` is read-only for client sessions — writes occur solely via `award_sparks()` SECURITY DEFINER functions.

---

## Key Invariants & Business Directrices

1. **SSOT Requirement**: `PROJECT_CONTEXT.md` must be updated after any architectural refactor or feature addition.
2. **Currency Standardization**: Main currency is ALWAYS **Sparks** (or **Sparks ✦**), NEVER "chispas".
3. **Reward Proposal & 1-Click Approval**: Children suggest rewards; parents approve and set the exact Spark cost in an interactive modal without deleting or recreating records.
4. **Adventure Proposals**: Warm sensory design (`#FAF9F7`), dynamic 2..6 step count selector, and `+ Añadir otro paso` dynamic expansion.
5. **Centralized Settings**: OpenDyslexic font toggle and reduced motion ("Menos Efectos y Animaciones") are consolidated in Tab 5 Settings (`profile`), keeping the header clean.
