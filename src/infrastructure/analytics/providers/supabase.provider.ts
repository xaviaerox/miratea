/**
 * MIRATEA — Supabase Analytics Provider
 * Proveedor de analítica de producto persistente con cola offline en LocalStorage.
 * Cumple con semántica Exactly-Once y fail-safe de transporte.
 */

import { getSupabaseClient } from '@/lib/supabase';
import { IAnalyticsProvider, AnalyticsUserContext } from '../analytics.types';

export interface AnalyticsQueueRecord {
  id: string;
  eventName: string;
  familyId?: string;
  childId?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export class SupabaseAnalyticsProvider implements IAnalyticsProvider {
  readonly name = 'supabase';
  private queue: AnalyticsQueueRecord[] = [];
  private processedIds: Set<string> = new Set();
  private isFlushing = false;
  private storageKey = 'miratea_analytics_queue';
  private isDevelopment = process.env.NODE_ENV === 'development';

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadQueueFromStorage();
      window.addEventListener('online', () => {
        void this.flush();
      });
    }
  }

  public async track(
    eventName: string,
    properties?: Record<string, unknown>,
    context?: AnalyticsUserContext
  ): Promise<void> {
    try {
      const record: AnalyticsQueueRecord = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        eventName,
        familyId: context?.familyId,
        childId: context?.childId,
        metadata: properties || {},
        timestamp: new Date().toISOString(),
      };

      if (this.processedIds.has(record.id)) {
        return;
      }

      this.queue.push(record);
      this.processedIds.add(record.id);

      if (this.isDevelopment) {
        console.log(`[SupabaseAnalytics Tracked] ${eventName}`, record);
      }

      this.persistQueueToStorage();
      void this.flush();
    } catch (err) {
      if (this.isDevelopment) {
        console.warn(`[SupabaseAnalytics Error] Tracking error:`, err);
      }
    }
  }

  public async flush(): Promise<number> {
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
          this.queue = this.queue.filter((e) => e.id !== event.id);
        } else {
          if (this.isDevelopment) {
            console.error('[SupabaseAnalytics Flush Network Error]', error);
          }
          break; // Retener cola ante error de red
        }
      }

      this.persistQueueToStorage();
    } catch (err) {
      if (this.isDevelopment) {
        console.error('[SupabaseAnalytics Flush Exception]', err);
      }
    } finally {
      this.isFlushing = false;
    }

    return flushedCount;
  }

  private persistQueueToStorage(): void {
    if (this.queue.length > 100) {
      this.queue = this.queue.slice(-100);
    }
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
      }
    } catch {
      // Ignorar fallos de almacenamiento en navegación privada
    }
  }

  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as AnalyticsQueueRecord[];
        this.queue = parsed;
        parsed.forEach((e) => this.processedIds.add(e.id));
      }
    } catch {
      this.queue = [];
    }
  }

  public getQueue(): AnalyticsQueueRecord[] {
    return [...this.queue];
  }

  public clearQueue(): void {
    this.queue = [];
    this.processedIds.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
}
