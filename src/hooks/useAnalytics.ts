'use client';

import { useCallback } from 'react';
import {
  analytics,
  AnalyticsEventName,
  EventMetadata,
  AnalyticsUserContext,
} from '@/infrastructure/analytics';

export function useAnalytics() {
  const trackEvent = useCallback(
    <K extends AnalyticsEventName>(
      eventName: K,
      metadata?: EventMetadata<K>,
      familyIdOrContext?: string | AnalyticsUserContext,
      childId?: string
    ) => {
      return analytics.track(eventName, metadata, familyIdOrContext, childId);
    },
    []
  );

  const identify = useCallback((userId: string, traits?: Record<string, unknown>) => {
    analytics.identify(userId, traits);
  }, []);

  const pageView = useCallback((name: string, properties?: Record<string, unknown>) => {
    analytics.page(name, properties);
  }, []);

  const reportError = useCallback((error: Error | unknown, context?: Record<string, unknown>) => {
    analytics.error(error, context);
  }, []);

  const flushEvents = useCallback(async () => {
    return analytics.flush();
  }, []);

  return {
    trackEvent,
    identify,
    pageView,
    reportError,
    flushEvents,
    getQueue: () => analytics.getQueue(),
    clearQueue: () => analytics.clearQueue(),
  };
}
