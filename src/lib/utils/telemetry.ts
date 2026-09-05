/**
 * Servicio de Telemetría y Captura de Errores para Cliente y PWA.
 * Aísla las llamadas de monitoreo e integra con la infraestructura unificada de observabilidad.
 */

import { analytics } from '@/infrastructure/analytics';

export class Telemetry {
  static captureError(error: Error | unknown, context?: Record<string, unknown>): void {
    analytics.error(error, context);
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, unknown>): void {
    analytics.message(message, level, context);
  }
}
