/**
 * MIRATEA — Privacy & Anti-PII Guard
 * Cumplimiento estricto de RGPD, ePrivacy, COPPA y protección reforzada de menores con neurodivergencia.
 * Prohíbe taxativamente la recolección de PII, diagnósticos clínicos o textos libres sensibles.
 */

const PII_KEY_REGEX = /name|nombre|email|phone|telefono|dni|nie|address|direccion|clinical|diag|password|token|secret|jwt/i;

const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\b[6789]\d{8}\b|\(?\d{2,3}\)?[-.\s]?\d{3}[-.\s]?\d{3,4}\b)/;
const PHONE_REGEX_GLOBAL = /(?:\+?\d{1,3}[-.\s]?)?(?:\b[6789]\d{8}\b|\(?\d{2,3}\)?[-.\s]?\d{3}[-.\s]?\d{3,4}\b)/g;

const PII_VALUE_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i, // Email
  PHONE_REGEX, // Phone
  /\b[0-9]{8}[A-Z]\b|\b[XYZ][0-9]{7}[A-Z]\b/i, // DNI / NIE (España)
  /\b(autismo|autista|tea|tdah|diagn[oó]stico|cl[ií]nica|terapia|psicolog[ií]a|m[eé]dico|paciente)\b/i, // Términos clínicos sensibles con o sin tilde
];

/**
 * Valida y desinfecta metadatos para analítica de producto.
 * Lanza error descriptivo si se detecta cualquier intento de registrar PII o datos de salud.
 */
export function validateAndSanitizeMetadata(raw: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(raw)) {
    if (val === undefined || val === null) continue;

    // Validación de claves
    if (PII_KEY_REGEX.test(key)) {
      throw new Error(`[Anti-PII Violation] Prohibited key '${key}' detected in analytics metadata.`);
    }

    if (typeof val === 'string') {
      if (val.length > 100) {
        throw new Error(`[Anti-PII Violation] Value for '${key}' exceeds maximum safe length (100 chars).`);
      }
      for (const pattern of PII_VALUE_PATTERNS) {
        if (pattern.test(val)) {
          throw new Error(`[Anti-PII Violation] Value for '${key}' matches prohibited PII/Clinical pattern.`);
        }
      }
      sanitized[key] = val;
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      sanitized[key] = val;
    } else if (Array.isArray(val)) {
      sanitized[key] = val
        .filter((item) => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean')
        .map((item) => {
          if (typeof item === 'string') {
            for (const pattern of PII_VALUE_PATTERNS) {
              if (pattern.test(item)) {
                throw new Error(`[Anti-PII Violation] Array element matches prohibited PII pattern.`);
              }
            }
          }
          return item;
        });
    }
  }

  return sanitized;
}

/**
 * Sanitiza una URL eliminando parámetros de consulta que pudieran contener tokens, emails o PII.
 */
export function sanitizeUrl(rawUrl: string): string {
  if (!rawUrl || rawUrl === 'SSR') return 'SSR';
  try {
    const parsed = new URL(rawUrl, 'https://miratea.app');
    // Eliminar query params sensibles
    const sensitiveParams = ['token', 'email', 'key', 'auth', 'code', 'child_name', 'session'];
    sensitiveParams.forEach((param) => parsed.searchParams.delete(param));
    return parsed.pathname + (parsed.search ? parsed.search : '');
  } catch {
    return rawUrl.split('?')[0] || rawUrl;
  }
}

/**
 * Sanitiza un error o excepción técnica antes de enviarlo a observabilidad (Sentry / logs).
 * Neutraliza emails, números o tokens que puedan haber quedado impresos en el stack trace o mensaje.
 */
export function sanitizeError(
  error: Error | unknown,
  context?: Record<string, unknown>
): { message: string; stack?: string; sanitizedContext?: Record<string, unknown> } {
  let message = 'Unknown error';
  let stack: string | undefined;

  if (error instanceof Error) {
    message = error.message;
    stack = error.stack;
  } else if (typeof error === 'string') {
    message = error;
  }

  // Filtrar PII común del mensaje
  const cleanMessage = message
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '[EMAIL_REDACTED]')
    .replace(PHONE_REGEX_GLOBAL, '[PHONE_REDACTED]')
    .replace(/\b[0-9]{8}[A-Z]\b|\b[XYZ][0-9]{7}[A-Z]\b/gi, '[ID_REDACTED]');

  const cleanStack = stack
    ? stack
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '[EMAIL_REDACTED]')
        .replace(PHONE_REGEX_GLOBAL, '[PHONE_REDACTED]')
    : undefined;

  let sanitizedContext: Record<string, unknown> | undefined;
  if (context) {
    try {
      sanitizedContext = validateAndSanitizeMetadata(context);
    } catch {
      sanitizedContext = { note: '[Context redacted due to potential PII]' };
    }
  }

  return {
    message: cleanMessage,
    stack: cleanStack,
    sanitizedContext,
  };
}
