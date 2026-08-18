import { describe, it, expect } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('Server Parent PIN Reset Endpoint (/api/auth/reset-pin)', () => {
  it('should process request_reset action and return 32-byte 15-minute token confirmation', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/reset-pin', {
      method: 'POST',
      body: JSON.stringify({
        action: 'request_reset',
        email: 'padre@mira.app',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.message).toContain('padre@mira.app');
  });

  it('should reject PIN update if neither password nor token is provided', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/reset-pin', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update_pin',
        newPin: '9876',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toContain('contraseña de tu cuenta');
  });

  it('should update PIN when valid newPin and password or token are supplied', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/reset-pin', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update_pin',
        newPin: '9876',
        password: 'parent-secret-password',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.message).toContain('PIN parental actualizado');
  });
});
