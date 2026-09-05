/**
 * MIRA — Client Error Tracker & Observability Helper
 * Captura errores no controlados en cliente y SSR con sanitización preventiva de PII.
 */

import { analytics, ErrorReport as UnifiedErrorReport } from '@/infrastructure/analytics';

export type ErrorReport = UnifiedErrorReport;

export class ErrorTracker {
  static captureError(error: Error | string, componentStack?: string): void {
    const err = typeof error === 'string' ? new Error(error) : error;
    analytics.error(err, componentStack ? { componentStack } : undefined);
  }

  static getReports(): ErrorReport[] {
    return analytics.getReports();
  }

  static clearReports(): void {
    analytics.clearReports();
  }
}
