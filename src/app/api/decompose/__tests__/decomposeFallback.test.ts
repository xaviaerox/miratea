import { describe, it, expect } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('Goal Decomposition Endpoint (/api/decompose)', () => {
  it('should return 400 Bad Request when prompt is empty or missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/decompose', {
      method: 'POST',
      body: JSON.stringify({ prompt: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('should safely return fallback mock decomposition JSON if external LLM fails or keys are missing', async () => {
    delete process.env.GROQ_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const req = new NextRequest('http://localhost:3000/api/decompose', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Aprender a montar en bicicleta' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.text).toBeDefined();
    expect(data.text).toBe('{"microtasks":[]}');
  });
});
