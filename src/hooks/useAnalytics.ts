'use client';

import { useCallback } from 'react';
import { analytics, AnalyticsEventName, EventMetadata } from '@/lib/analytics/tracker';

export function useAnalytics() {
  const trackEvent = useCallback(
    <K extends AnalyticsEventName>(
      eventName: K,
      metadata?: EventMetadata<K>,
      familyId?: string,
      childId?: string
    ) => {
      return analytics.track(eventName, metadata, familyId, childId);
    },
    []
  );

  const flushEvents = useCallback(async () => {
    return analytics.flushQueue();
  }, []);

  return {
    trackEvent,
    flushEvents,
    getQueue: () => analytics.getQueue(),
    clearQueue: () => analytics.clearQueue(),
  };
}

