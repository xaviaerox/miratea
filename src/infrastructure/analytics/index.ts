/**
 * MIRATEA — Centralized Analytics & Observability Facade
 * Punto de entrada único desacoplado para telemetría técnica, analítica de producto y privacidad Zero-PII.
 */

import {
  IAnalyticsProvider,
  ITelemetryProvider,
  AnalyticsUserContext,
  ErrorReport,
} from './analytics.types';
import { AnalyticsEventName, EventMetadata } from './analytics.events';
import { validateAndSanitizeMetadata } from './privacy.guard';
import { SupabaseAnalyticsProvider, AnalyticsQueueRecord } from './providers/supabase.provider';
import { SentryTelemetryProvider } from './providers/sentry.provider';
import { PostHogAnalyticsProvider } from './providers/posthog.provider';

export * from './analytics.types';
export * from './analytics.events';
export * from './privacy.guard';

class AnalyticsService {
  private analyticsProviders: IAnalyticsProvider[] = [];
  private telemetryProviders: ITelemetryProvider[] = [];
  private isDevelopment = process.env.NODE_ENV === 'development';
  private supabaseProvider: SupabaseAnalyticsProvider;
  private sentryProvider: SentryTelemetryProvider;
  private posthogProvider: PostHogAnalyticsProvider;

  constructor() {
    this.supabaseProvider = new SupabaseAnalyticsProvider();
    this.sentryProvider = new SentryTelemetryProvider();
    this.posthogProvider = new PostHogAnalyticsProvider();

    this.analyticsProviders = [this.supabaseProvider, this.posthogProvider];
    this.telemetryProviders = [this.sentryProvider];
  }

  /**
   * Registra un evento de producto tipado con validación anti-PII y persistencia offline.
   * Compatible con firma nueva (context object) y firma legada (familyId, childId).
   */
  public track<K extends AnalyticsEventName>(
    eventName: K,
    metadata?: EventMetadata<K>,
    contextOrFamilyId?: AnalyticsUserContext | string,
    legacyChildId?: string
  ): AnalyticsQueueRecord | null {
    try {
      // Resolver contexto
      let context: AnalyticsUserContext = {};
      if (typeof contextOrFamilyId === 'string') {
        context = { familyId: contextOrFamilyId, childId: legacyChildId };
      } else if (contextOrFamilyId) {
        context = contextOrFamilyId;
      }

      // Validar y sanitizar metadatos (Zero-PII)
      const cleanMetadata = validateAndSanitizeMetadata((metadata as Record<string, unknown>) || {});

      // Dispatch a proveedores analíticos
      for (const provider of this.analyticsProviders) {
        try {
          void provider.track(eventName, cleanMetadata, context);
        } catch (err) {
          if (this.isDevelopment) {
            console.warn(`[AnalyticsService] Error dispatching to provider ${provider.name}:`, err);
          }
        }
      }

      return {
        id: `${Date.now()}`,
        eventName,
        familyId: context.familyId,
        childId: context.childId,
        metadata: cleanMetadata,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      if (this.isDevelopment) {
        console.warn(`[AnalyticsService Blocked] Event '${eventName}' rejected by Anti-PII Guard:`, err);
      }
      return null;
    }
  }

  /**
   * Identifica a un usuario mediante identificador técnico opaco (family_id / UUID).
   * Prohíbe terminantemente el uso de correos o nombres como ID.
   */
  public identify(userId: string, traits?: Record<string, unknown>): void {
    try {
      if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(userId)) {
        throw new Error('[Anti-PII Violation] Direct email used as userId in identify.');
      }

      const cleanTraits = traits ? validateAndSanitizeMetadata(traits) : undefined;
      for (const provider of this.analyticsProviders) {
        if (provider.identify) {
          try {
            void provider.identify(userId, cleanTraits);
          } catch {
            // Fail-safe
          }
        }
      }
    } catch (err) {
      if (this.isDevelopment) {
        console.warn('[AnalyticsService identify blocked]:', err);
      }
    }
  }

  /**
   * Registra una vista de pantalla o ruta.
   */
  public page(name: string, properties?: Record<string, unknown>): void {
    try {
      const cleanProps = properties ? validateAndSanitizeMetadata(properties) : undefined;
      for (const provider of this.analyticsProviders) {
        if (provider.page) {
          try {
            void provider.page(name, cleanProps);
          } catch {
            // Fail-safe
          }
        }
      }
    } catch {
      // Fail-safe
    }
  }

  /**
   * Captura una excepción técnica o error no controlado con sanitización preventiva de PII.
   */
  public error(error: Error | unknown, context?: Record<string, unknown>): void {
    try {
      for (const provider of this.telemetryProviders) {
        try {
          provider.captureError(error, context);
        } catch {
          // Fail-safe
        }
      }
    } catch {
      // Fail-safe
    }
  }

  /**
   * Registra un mensaje de telemetría o advertencia de rendimiento/sistema.
   */
  public message(
    msg: string,
    level: 'info' | 'warning' | 'error' = 'info',
    context?: Record<string, unknown>
  ): void {
    try {
      for (const provider of this.telemetryProviders) {
        try {
          provider.captureMessage(msg, level, context);
        } catch {
          // Fail-safe
        }
      }
    } catch {
      // Fail-safe
    }
  }

  /**
   * Fuerza el vaciado inmediato de la cola offline.
   */
  public async flush(): Promise<number> {
    try {
      return await this.supabaseProvider.flush();
    } catch {
      return 0;
    }
  }

  /**
   * Métodos utilitarios de inspección y testing.
   */
  public getQueue(): AnalyticsQueueRecord[] {
    return this.supabaseProvider.getQueue();
  }

  public clearQueue(): void {
    this.supabaseProvider.clearQueue();
  }

  public getReports(): ErrorReport[] {
    return this.sentryProvider.getReports();
  }

  public clearReports(): void {
    this.sentryProvider.clearReports();
  }
}

export const analytics = new AnalyticsService();
export default analytics;
