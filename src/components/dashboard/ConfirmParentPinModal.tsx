'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ConfirmParentPinModalProps {
  isOpen: boolean;
  actionTitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ConfirmParentPinModal({
  isOpen,
  actionTitle = 'Confirmación Parental Requerida',
  onSuccess,
  onCancel,
}: ConfirmParentPinModalProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(null);
    setResetMsg(null);

    // Auto-focus next field
    if (value && index < 3) {
      const nextInput = document.getElementById(`confirm-pin-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`confirm-pin-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join('');
    if (fullPin.length !== 4) {
      setError('Introduce los 4 dígitos del PIN.');
      return;
    }

    setLoading(true);
    setError(null);
    setResetMsg(null);

    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: fullPin }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        onSuccess();
      } else {
        setError(data.error || 'PIN incorrecto. Inténtalo de nuevo.');
        setPin(['', '', '', '']);
        document.getElementById('confirm-pin-input-0')?.focus();
      }
    } catch {
      setError('Error al verificar el PIN parental. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_reset', email: 'padre@mira.app' }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResetMsg(data.message);
      } else {
        setError(data.error || 'No se pudo enviar el correo de recuperación.');
      }
    } catch {
      setError('Error de conexión al solicitar restablecimiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <Card className="w-full max-w-sm border-bloom-200 bg-[#FAF9F7] shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bloom-100 text-bloom-600">
            <span className="text-2xl">🔒</span>
          </div>
          <CardTitle className="text-xl text-stone-800 font-serif">
            {actionTitle}
          </CardTitle>
          <p className="text-xs text-stone-500 mt-1">
            Re-introduce tu PIN parental de 4 dígitos para confirmar esta acción sensible.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center gap-2">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`confirm-pin-input-${index}`}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="h-12 w-12 rounded-xl border border-stone-300 bg-white text-center text-xl font-bold text-stone-800 shadow-sm focus:border-bloom-400 focus:outline-none focus:ring-2 focus:ring-bloom-300"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-semibold text-bloom-600 hover:text-bloom-700 underline underline-offset-2"
                disabled={loading}
              >
                ¿Olvidaste tu PIN? Recibir correo de recuperación
              </button>
            </div>

            {error && (
              <p className="text-center text-xs font-medium text-rose-600 animate-pulse">
                {error}
              </p>
            )}

            {resetMsg && (
              <p className="text-center text-xs font-medium text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                {resetMsg}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="flex-1 border-stone-300 text-stone-600 hover:bg-stone-100"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-bloom-500 text-white hover:bg-bloom-600"
                disabled={loading || pin.join('').length !== 4}
              >
                {loading ? 'Verificando...' : 'Confirmar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
