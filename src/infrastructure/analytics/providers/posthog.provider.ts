/**
 * MIRATEA — PostHog Product Analytics Provider (Opcional / Desacoplado)
 * Adaptador plug-and-play para PostHog sin acoplamiento duro, sin SDK invasivo ni vendor lock-in.
 * Soporta transporte directo HTTP Capture API con tolerancia a fallos y Zero-PII.
 */

import { IAnalyticsProvider, AnalyticsUserContext } from '../analytics.types';

export class PostHogAnalyticsProvider implements IAnalyticsProvider {
  readonly name = 'posthog';
  private apiKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  private apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

  private sendCapture(event: string, properties?: Record<string, unknown>, distinctId?: string): void {
    if (!this.apiKey) return;

    try {
      const endpoint = `${this.apiHost.replace(/\/$/, '')}/capture/`;
      const payload = {
        api_key: this.apiKey,
        event,
        properties: {
          ...properties,
          distinct_id: distinctId || 'anonymous_user',
          $lib: 'miratea-analytics',
          $lib_version: '1.2.0',
        },
        timestamp: new Date().toISOString(),
      };

      if (typeof fetch === 'function') {
        void fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
          mode: 'cors',
        }).catch(() => {
          // Fail-safe silencioso
        });
      }
    } catch {
      // Fail-safe absoluto
    }
  }

  public track(
    eventName: string,
    properties?: Record<string, unknown>,
    context?: AnalyticsUserContext
  ): void {
    const distinctId = context?.familyId || context?.anonymousId;
    this.sendCapture(eventName, properties, distinctId);
  }

  public identify(userId: string, traits?: Record<string, unknown>): void {
    this.sendCapture('$identify', { $set: traits }, userId);
  }

  public page(name: string, properties?: Record<string, unknown>): void {
    this.sendCapture('$pageview', { $current_url: name, ...properties });
  }
}
