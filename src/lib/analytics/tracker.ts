import { getSupabaseClient } from '@/lib/supabase';

export type AnalyticsEventName =
  | 'signup'
  | 'login'
  | 'family_created'
  | 'child_created'
  | 'companion_created'
  | 'companion_customized'
  | 'routine_created'
  | 'routine_task_completed'
  | 'routine_completed'
  | 'goal_created'
  | 'goal_completed'
  | 'spark_earned'
  | 'spark_spent'
  | 'reward_created'
  | 'reward_redeemed'
  | 'emotion_logged'
  | 'breathing_started'
  | 'breathing_completed'
  | 'calm_space_opened'
  | 'ai_story_created'
  | 'companion_chat_started'
  | 'goal_decomposition_used'
  | 'pricing_viewed'
  | 'early_family_signup'
  | 'privacy_viewed'
  | 'feedback_submitted'
  | 'child_sentiment_submitted'
  | 'parent_value_evaluated'
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'activation_completed'
  | 'onboarding_dismissed';

export interface EventPayloadMap {
  signup: { provider?: string };
  login: { mode?: string };
  family_created: { familyId?: string };
  child_created: { avatarId?: string };
  companion_created: { stage?: string };
  companion_customized: { accessoryId?: string };
  routine_created: { taskCount?: number };
  routine_task_completed: { sparkEarned?: number };
  routine_completed: { taskCount?: number; totalSparks?: number };
  goal_created: { stepCount?: number };
  goal_completed: { totalSparks?: number };
  spark_earned: { amount: number; reason?: string };
  spark_spent: { amount: number };
  reward_created: { iconId?: string };
  reward_redeemed: { cost?: number };
  emotion_logged: { valence?: number; energyLevel?: number };
  breathing_started: { mode?: string };
  breathing_completed: { durationSeconds?: number };
  calm_space_opened: { source?: string };
  ai_story_created: { chapterCount?: number };
  companion_chat_started: { isTap?: boolean };
  goal_decomposition_used: { targetCount?: number };
  pricing_viewed: { page: string };
  early_family_signup: { billingCycle: 'monthly' | 'annual'; childAgeRange?: string };
  privacy_viewed: { sourcePage: string };
  feedback_submitted: { type: string };
  child_sentiment_submitted: { sentimentEmoji: string; source?: string };
  parent_value_evaluated: { disappearImpact: string; rating?: number };
  onboarding_started: { totalSteps?: number };
  onboarding_step_completed: { stepId: string; stepIndex?: number };
  activation_completed: { durationSeconds?: number };
  onboarding_dismissed: { completedCount?: number };
}

export type EventMetadata<K extends AnalyticsEventName> = K extends keyof EventPayloadMap
  ? EventPayloadMap[K]
  : Record<string, unknown>;

export interface AnalyticsEventRecord {
  id: string;
  eventName: AnalyticsEventName;
  familyId?: string;
  childId?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ANTI-PII VALIDATOR & SANITIZER (Guard 1: Strict Validation / Guard 2: Sanitizer)
// ─────────────────────────────────────────────────────────────────────────────

const PII_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i, // Email
  /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, // Phone
  /\b[0-9]{8}[A-Z]\b|\b[XYZ][0-9]{7}[A-Z]\b/i, // DNI / NIE
  /\b(autismo|autista|tea|tdah|diagnostico|clinica|terapia|psicologia|medico|paciente)\b/i, // Health / Clinical terms
];

export function validateAndSanitizeMetadata(raw: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(raw)) {
    if (val === undefined || val === null) continue;

    // Check key for PII keywords
    if (/name|nombre|email|phone|telefono|dni|address|direccion|clinical|diag/i.test(key)) {
      throw new Error(`[Anti-PII Violation] Key '${key}' is prohibited in analytics metadata.`);
    }

    if (typeof val === 'string') {
      // Reject if string exceeds safe scalar length or matches PII patterns
      if (val.length > 100) {
        throw new Error(`[Anti-PII Violation] Value for '${key}' exceeds max length (100 chars).`);
      }
      for (const pattern of PII_PATTERNS) {
        if (pattern.test(val)) {
          throw new Error(`[Anti-PII Violation] Value for '${key}' contains sensitive PII or health data.`);
        }
      }
      sanitized[key] = val;
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      sanitized[key] = val;
    } else if (Array.isArray(val)) {
      sanitized[key] = val.filter((item) => typeof item === 'string' || typeof item === 'number');
    }
  }

  return sanitized;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT ANALYTICS TRACKER CLASS
// ─────────────────────────────────────────────────────────────────────────────

class ProductAnalyticsTracker {
  private queue: AnalyticsEventRecord[] = [];
  private processedIds: Set<string> = new Set();
  private isFlushing = false;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private storageKey = 'miratea_analytics_queue';

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadQueueFromStorage();
      window.addEventListener('online', () => {
        void this.flushQueue();
      });
    }
  }

  public track<K extends AnalyticsEventName>(
    eventName: K,
    metadata?: EventMetadata<K>,
    familyId?: string,
    childId?: string
  ): AnalyticsEventRecord | null {
    try {
      const cleanMetadata = validateAndSanitizeMetadata((metadata as Record<string, unknown>) || {});

      const record: AnalyticsEventRecord = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        eventName,
        familyId,
        childId,
        metadata: cleanMetadata,
        timestamp: new Date().toISOString(),
      };

      // Prevent duplicates
      if (this.processedIds.has(record.id)) {
        return null;
      }

      this.queue.push(record);
      this.processedIds.add(record.id);

      if (this.isDevelopment) {
        console.log(`[Analytics Tracked] ${eventName}`, record);
      }

      this.persistQueueToStorage();
      void this.flushQueue();

      return record;
    } catch (err) {
      if (this.isDevelopment) {
        console.warn(`[Analytics Blocked] Event '${eventName}' rejected:`, err);
      }
      return null;
    }
  }

  public async flushQueue(): Promise<number> {
    if (this.isFlushing || this.queue.length === 0 || typeof window === 'undefined') {
      return 0;
    }

    this.isFlushing = true;
    let flushedCount = 0;

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        this.isFlushing = false;
        return 0;
      }

      // Copy batch to avoid concurrency issues
      const batch = [...this.queue];

      for (const event of batch) {
        const { error } = await supabase.from('analytics_events').insert({
          family_id: event.familyId || null,
          child_id: event.childId || null,
          event_name: event.eventName,
          metadata: event.metadata as Record<string, never>,
          created_at: event.timestamp,
        });

        if (!error) {
          flushedCount++;
          // Remove from local queue
          this.queue = this.queue.filter((e) => e.id !== event.id);
        } else {
          if (this.isDevelopment) {
            console.error('[Analytics Transport Error]', error);
          }
          break; // Stop batching on first network error to retain queue
        }
      }

      this.persistQueueToStorage();
    } catch (err) {
      if (this.isDevelopment) {
        console.error('[Analytics Flush Error]', err);
      }
    } finally {
      this.isFlushing = false;
    }

    return flushedCount;
  }

  private persistQueueToStorage() {
    // Cap queue at last 100 events in memory
    if (this.queue.length > 100) {
      this.queue = this.queue.slice(-100);
    }
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  }

  private loadQueueFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as AnalyticsEventRecord[];
        this.queue = parsed;
        parsed.forEach((e) => this.processedIds.add(e.id));
      }
    } catch {
      this.queue = [];
    }
  }

  public getQueue(): AnalyticsEventRecord[] {
    return [...this.queue];
  }

  public clearQueue() {
    this.queue = [];
    this.processedIds.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
}

export const analytics = new ProductAnalyticsTracker();

