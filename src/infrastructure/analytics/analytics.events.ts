/**
 * MIRATEA — Centralized Analytics Events Taxonomy
 * Nombres descriptivos, en inglés, snake_case y orientados a acciones.
 * Cero PII, datos de salud o información clínica.
 */

export type AnalyticsEventName =
  // Lifecycle & Navigation
  | 'app_opened'
  | 'page_viewed'
  | 'feature_used'
  | 'settings_updated'
  // Onboarding & Auth
  | 'signup'
  | 'signup_completed'
  | 'login'
  | 'login_completed'
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'activation_completed'
  | 'onboarding_dismissed'
  // Family & Profiles
  | 'family_created'
  | 'child_created'
  | 'companion_created'
  | 'companion_customized'
  // Routines
  | 'routine_created'
  | 'routine_task_completed'
  | 'routine_completed'
  // Goals & Tasks
  | 'goal_created'
  | 'goal_completed'
  | 'goal_decomposition_used'
  // Sparks & Rewards
  | 'spark_earned'
  | 'spark_spent'
  | 'reward_created'
  | 'reward_redeemed'
  // Emotional & Calm Space (Zero-PII / Anonimizado)
  | 'emotion_logged'
  | 'breathing_started'
  | 'breathing_completed'
  | 'calm_space_opened'
  | 'ai_story_created'
  | 'companion_chat_started'
  // Feedback & Commercial Validation
  | 'pricing_viewed'
  | 'early_family_signup'
  | 'privacy_viewed'
  | 'feedback_submitted'
  | 'child_sentiment_submitted'
  | 'parent_value_evaluated';

export interface EventPayloadMap {
  // Lifecycle & Navigation
  app_opened: { source?: string; isPwa?: boolean };
  page_viewed: { path: string; referrer?: string };
  feature_used: { featureName: string };
  settings_updated: { settingKey: string };

  // Auth & Onboarding
  signup: { provider?: string };
  signup_completed: { provider?: string };
  login: { mode?: string };
  login_completed: { mode?: string };
  onboarding_started: { totalSteps?: number };
  onboarding_step_completed: { stepId: string; stepIndex?: number };
  activation_completed: { durationSeconds?: number };
  onboarding_dismissed: { completedCount?: number };

  // Family & Profiles
  family_created: { familyId?: string };
  child_created: { avatarId?: string };
  companion_created: { stage?: string };
  companion_customized: { accessoryId?: string };

  // Routines
  routine_created: { taskCount?: number };
  routine_task_completed: { sparkEarned?: number };
  routine_completed: { taskCount?: number; totalSparks?: number };

  // Goals
  goal_created: { stepCount?: number };
  goal_completed: { totalSparks?: number };
  goal_decomposition_used: { targetCount?: number };

  // Sparks & Rewards (Tokens inmutables: Sparks ✦)
  spark_earned: { amount: number; reason?: string };
  spark_spent: { amount: number };
  reward_created: { iconId?: string };
  reward_redeemed: { cost?: number };

  // Emotional & Sensory (Metadatos numéricos/escalares, nunca diagnósticos o texto libre clínico)
  emotion_logged: { valence?: number; energyLevel?: number };
  breathing_started: { mode?: string };
  breathing_completed: { durationSeconds?: number };
  calm_space_opened: { source?: string };
  ai_story_created: { chapterCount?: number };
  companion_chat_started: { isTap?: boolean };

  // Feedback & Commercial Validation
  pricing_viewed: { page: string };
  early_family_signup: { billingCycle: 'monthly' | 'annual'; childAgeRange?: string };
  privacy_viewed: { sourcePage: string };
  feedback_submitted: { type: string };
  child_sentiment_submitted: { sentimentEmoji: string; source?: string };
  parent_value_evaluated: { disappearImpact: string; rating?: number };
}

export type EventMetadata<K extends AnalyticsEventName> = K extends keyof EventPayloadMap
  ? EventPayloadMap[K]
  : Record<string, unknown>;
