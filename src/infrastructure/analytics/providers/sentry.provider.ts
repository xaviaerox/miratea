/**
 * MIRATEA — Sentry & Observability Telemetry Provider
 * Proveedor de observabilidad técnica para excepciones, Web Vitals y telemetría de fallos.
 * Incorpora transporte de envelope HTTP nativo y filtrado preventivo Zero-PII.
 */

import { ITelemetryProvider, ErrorReport } from '../analytics.types';
import { sanitizeError, sanitizeUrl } from '../privacy.guard';

export class SentryTelemetryProvider implements ITelemetryProvider {
  readonly name = 'sentry';
  private reports: ErrorReport[] = [];
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  private endpoint: string | null = null;
  private maxReports = 50;

  constructor() {
    if (this.dsn) {
      this.initializeSentry();
    }
  }

  private initializeSentry(): void {
    try {
      if (!this.dsn) return;
      const urlObj = new URL(this.dsn);
      const publicKey = urlObj.username;
      const host = urlObj.host;
      const projectId = urlObj.pathname.replace(/^\//, '');

      if (publicKey && host && projectId) {
        this.endpoint = `https://${host}/api/${projectId}/envelope/?sentry_version=7&sentry_key=${publicKey}&sentry_client=miratea-telemetry%2F1.2.0`;
        if (this.isDevelopment) {
          console.log('[SentryProvider] Initialized with endpoint:', host);
        }
      }
    } catch {
      this.endpoint = null;
    }
  }

  public captureError(error: Error | unknown, context?: Record<string, unknown>): void {
    try {
      const sanitized = sanitizeError(error, context);
      const url = typeof window !== 'undefined' ? sanitizeUrl(window.location.href) : 'SSR';

      const report: ErrorReport = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        message: sanitized.message,
        stack: sanitized.stack,
        url,
        timestamp: new Date().toISOString(),
        context: sanitized.sanitizedContext,
      };

      this.reports.push(report);
      if (this.reports.length > this.maxReports) {
        this.reports.shift();
      }

      if (this.isDevelopment) {
        console.error('[Telemetry Error Sanitized]', {
          message: report.message,
          url: report.url,
          timestamp: report.timestamp,
          context: report.context,
        });
      }

      // Despacho no bloqueante a Sentry
      this.sendEnvelope('error', report.message, report.stack, report.context, report.url);
    } catch {
      // Fail-safe absoluto: la observabilidad técnica jamás puede causar un crash
    }
  }

  public captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    context?: Record<string, unknown>
  ): void {
    try {
      const sanitized = sanitizeError(message, context);
      if (this.isDevelopment) {
        console.log(`[Telemetry ${level.toUpperCase()}]`, sanitized.message, sanitized.sanitizedContext);
      }

      this.sendEnvelope(level, sanitized.message, undefined, sanitized.sanitizedContext);
    } catch {
      // Fail-safe
    }
  }

  private sendEnvelope(
    level: 'error' | 'warning' | 'info',
    message: string,
    stack?: string,
    extra?: Record<string, unknown>,
    url?: string
  ): void {
    if (!this.endpoint) return;

    try {
      const eventId = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const header = JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() });
      const itemHeader = JSON.stringify({ type: 'event', content_type: 'application/json' });
      const itemBody = JSON.stringify({
        event_id: eventId,
        platform: 'javascript',
        level,
        message,
        release: '1.2.0',
        environment: process.env.NODE_ENV || 'production',
        tags: {
          app: 'miratea',
          url: url || 'SSR',
        },
        exception: stack
          ? {
              values: [
                {
                  type: 'Error',
                  value: message,
                  stacktrace: { frames: [{ filename: url || 'app', function: 'captureError', lineno: 1 }] },
                },
              ],
            }
          : undefined,
        extra,
      });

      const payload = `${header}\n${itemHeader}\n${itemBody}\n`;

      if (typeof fetch === 'function') {
        void fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-sentry-envelope' },
          body: payload,
          keepalive: true,
          mode: 'cors',
        }).catch(() => {
          // Fail-safe silencioso ante problemas de red
        });
      }
    } catch {
      // Fail-safe
    }
  }

  public getReports(): ErrorReport[] {
    return [...this.reports];
  }

  public clearReports(): void {
    this.reports = [];
  }
}
