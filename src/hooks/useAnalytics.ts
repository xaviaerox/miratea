'use client';

import { useCallback } from 'react';
import { analytics, AnalyticsEventName } from '@/lib/analytics/tracker';

export function useAnalytics() {
  const trackEvent = useCallback(
    (eventName: AnalyticsEventName, metadata?: Record<string, unknown>, familyId?: string, childId?: string) => {
      analytics.track(eventName, metadata, familyId, childId);
    },
    []
  );

  return { trackEvent, getEventsHistory: () => analytics.getEventsHistory() };
}
