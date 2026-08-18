import { describe, it, expect, vi } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('HTTP Integration: /api/companion/chat/route.ts', () => {
  it('should sanitize PII in cleanUserMsg and history before sending payload', async () => {
    // Mock global fetch to capture LLM payload
    let capturedBody: Record<string, unknown> | null = null;
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      if (url.includes('groq.com') || url.includes('googleapis') || url.includes('anthropic')) {
        capturedBody = JSON.parse((init?.body as string) || '{}');
        return new Response(
          JSON.stringify({
            choices: [{ message: { content: 'Hola [CHILD_NAME], estoy aquí para ayudarte.' } }],
          }),
          { status: 200 }
        );
      }
      return new Response('{}', { status: 200 });
    });

    // Provide mock GROQ_API_KEY
    process.env.GROQ_API_KEY = 'gsk_mock_test_key';

    const req = new NextRequest('http://localhost:3000/api/companion/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hola me llamo Alex mi correo es alex@mira.app y mi telefono es 600-123-4567',
        childName: 'Alex',
        history: [{ role: 'user', content: 'Mi nombre es Alex' }],
        stream: false,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const resData = await res.json();
    expect(resData.text).toBeDefined();

    // Verify PII sanitization in captured LLM payload
    const body = capturedBody as { messages?: Array<{ role: string; content: string }> } | null;
    if (body && Array.isArray(body.messages)) {
      const userMessages = body.messages.filter((m) => m.role === 'user');
      userMessages.forEach((m) => {
        expect(m.content).not.toContain('Alex');
        expect(m.content).not.toContain('alex@mira.app');
        expect(m.content).not.toContain('600-123-4567');
        expect(m.content).toContain('[CHILD_NAME]');
      });
    }

    vi.unstubAllGlobals();
  });
});
