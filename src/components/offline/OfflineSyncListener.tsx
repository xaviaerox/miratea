'use client';

import { useEffect } from 'react';
import { initOfflineQueueSync } from '@/lib/offline/OfflineQueueSync';

export function OfflineSyncListener() {
  useEffect(() => {
    // Initialize offline queue listener on application mount
    const queue = initOfflineQueueSync();

    // Trigger queue drain immediately if online
    if (typeof window !== 'undefined' && navigator.onLine) {
      queue.drain().catch((err: unknown) => {
        console.warn('[OfflineSyncListener] Initial drain error:', err);
      });
    }
  }, []);

  return null;
}
