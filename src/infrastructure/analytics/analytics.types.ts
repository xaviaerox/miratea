/**
 * MIRATEA — Analytics & Observability Domain Types & Contracts
 * Arquitectura desacoplada para telemetría, analítica de producto y privacidad Zero-PII.
 */

export interface AnalyticsUserContext {
  familyId?: string;
  childId?: string;
  anonymousId?: string;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface IAnalyticsProvider {
  readonly name: string;
  track(eventName: string, properties?: Record<string, unknown>, context?: AnalyticsUserContext): Promise<void> | void;
  identify?(userId: string, traits?: Record<string, unknown>): Promise<void> | void;
  page?(name: string, properties?: Record<string, unknown>): Promise<void> | void;
  flush?(): Promise<number>;
  getQueue?(): unknown[];
  clearQueue?(): void;
}

export interface ITelemetryProvider {
  readonly name: string;
  captureError(error: Error | unknown, context?: Record<string, unknown>): void;
  captureMessage(message: string, level?: 'info' | 'warning' | 'error', context?: Record<string, unknown>): void;
  getReports?(): ErrorReport[];
  clearReports?(): void;
}

export interface AnalyticsConfig {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production' | 'test';
  release?: string;
}
