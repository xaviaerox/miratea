import { describe, it, expect } from 'vitest';
import { sanitizePii, restorePii } from '@/lib/security/PiiSanitizer';

describe('Chat PII Sanitization', () => {
  it('should mask child name, email, and phone in user chat message', () => {
    const rawMessage = 'Hola soy Alex garcia@email.com y mi telefono es 600-123-4567';
    const { sanitizedText, replacements } = sanitizePii(rawMessage, 'Alex');

    expect(sanitizedText).not.toContain('Alex');
    expect(sanitizedText).not.toContain('garcia@email.com');
    expect(sanitizedText).not.toContain('600-123-4567');
    expect(sanitizedText).toContain('[CHILD_NAME]');
    expect(sanitizedText).toContain('[EMAIL]');
    expect(sanitizedText).toContain('[PHONE]');

    const restored = restorePii(sanitizedText, replacements);
    expect(restored).toContain('Alex');
  });
});
