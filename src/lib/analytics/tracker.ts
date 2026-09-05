/**
 * MIRATEA — Legacy Analytics Tracker Bridge
 * Mantiene compatibilidad retroactiva completa redirigiendo a src/infrastructure/analytics.
 */

import {
  analytics as unifiedAnalytics,
  validateAndSanitizeMetadata as unifiedValidate,
  AnalyticsEventName as UnifiedEventName,
  EventPayloadMap as UnifiedPayloadMap,
  EventMetadata as UnifiedMetadata,
} from '@/infrastructure/analytics';

export type AnalyticsEventName = UnifiedEventName;
export type EventPayloadMap = UnifiedPayloadMap;
export type EventMetadata<K extends AnalyticsEventName> = UnifiedMetadata<K>;

export interface AnalyticsEventRecord {
  id: string;
  eventName: AnalyticsEventName;
  familyId?: string;
  childId?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export const validateAndSanitizeMetadata = unifiedValidate;

export const analytics = {
  track: <K extends AnalyticsEventName>(
    eventName: K,
    metadata?: EventMetadata<K>,
    familyId?: string,
    childId?: string
  ) => {
    return unifiedAnalytics.track(eventName, metadata, familyId, childId);
  },
  flushQueue: () => unifiedAnalytics.flush(),
  getQueue: () => unifiedAnalytics.getQueue(),
  clearQueue: () => unifiedAnalytics.clearQueue(),
};

export default analytics;
