export type AnalyticsEventName =
  | 'signup'
  | 'login'
  | 'family_created'
  | 'child_created'
  | 'companion_created'
  | 'companion_customized'
  | 'routine_created'
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
  | 'privacy_viewed';

export interface AnalyticsEventPayload {
  eventName: AnalyticsEventName;
  familyId?: string;
  childId?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

class ProductAnalyticsTracker {
  private eventsQueue: AnalyticsEventPayload[] = [];
  private isDevelopment = process.env.NODE_ENV === 'development';

  public track(eventName: AnalyticsEventName, metadata?: Record<string, unknown>, familyId?: string, childId?: string) {
    const payload: AnalyticsEventPayload = {
      eventName,
      familyId,
      childId,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    };

    this.eventsQueue.push(payload);

    if (this.isDevelopment) {
      console.log(`[Analytics Event] ${eventName}`, payload);
    }

    this.persistEvent(payload);
  }

  private async persistEvent(payload: AnalyticsEventPayload) {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('miratea_analytics_queue');
        const queue: AnalyticsEventPayload[] = stored ? JSON.parse(stored) : [];
        queue.push(payload);
        // Keep queue capped at last 100 events locally
        if (queue.length > 100) queue.shift();
        localStorage.setItem('miratea_analytics_queue', JSON.stringify(queue));
      }
    } catch {
      // Storage unavailable or private window
    }
  }

  public getEventsHistory(): AnalyticsEventPayload[] {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('miratea_analytics_queue');
        return stored ? JSON.parse(stored) : [];
      }
    } catch {
      return [];
    }
    return [];
  }
}

export const analytics = new ProductAnalyticsTracker();
