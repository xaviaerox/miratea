import { describe, it, expect } from 'vitest';
import { POST, hashPin } from '../route';
import { NextRequest } from 'next/server';

describe('Server Parent PIN Verification Endpoint (/api/auth/verify-pin)', () => {
  it('should calculate sha256 hash correctly', () => {
    const hash = hashPin('1234');
    expect(hash).toBe('03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');
  });

  it('should accept valid default demo PIN 1234 in static mode', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ pin: '1234' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('should reject invalid PIN 0000 with 401 Unauthorized', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ pin: '0000' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toContain('PIN incorrecto');
  });

  it('should reject malformed non-4-digit PIN with 400 Bad Request', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ pin: '12' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
  });
});
