'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUpParent } = useAuth();
  const [step, setStep] = useState<'account' | 'family'>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEarlyAccess = searchParams.get('plan') === 'early_access';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 'account') {
      if (!consentGiven) {
        setError('Debe confirmar su mayoría de edad y tutela legal para continuar.');
        return;
      }
      setStep('family');
      return;
    }

    if (!consentGiven) {
      setError('Debe confirmar su mayoría de edad y tutela legal para registrar la cuenta.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await signUpParent({
      email,
      password,
      display_name: displayName,
      family_name: familyName,
      consent_given: consentGiven,
      consent_timestamp: new Date().toISOString(),
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    router.replace('/dashboard');
  }

  return (
    <Card>
      <h2 className="font-display text-2xl text-stone-800 mb-2 text-center">
        {step === 'account' ? 'Crear cuenta' : 'Tu familia'}
      </h2>
      <p className="text-sm text-stone-500 text-center mb-6">
        {step === 'account'
          ? 'Empieza como padre o madre'
          : 'Ponle nombre a vuestra familia'}
      </p>

      {isEarlyAccess && (
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-teal-50 border border-amber-200/80 text-stone-800 text-xs flex items-start gap-2.5 shadow-sm">
          <span className="text-amber-600 font-bold text-sm">✦</span>
          <div>
            <p className="font-bold text-teal-900">Plaza Early Access Activada</p>
            <p className="text-stone-600 mt-0.5 leading-snug">
              Al completar el registro, tu familia disfrutará de todo el contenido Premium de MIRATEA de forma 100% gratuita y vitalicia.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {step === 'account' ? (
          <>
            <Input
              label="Tu nombre"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              placeholder="¿Cómo te llamas?"
              autoFocus
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="tu@email.com"
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              placeholder="Mínimo 8 caracteres"
              minLength={8}
            />
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="parent-consent-checkbox"
                type="checkbox"
                checked={consentGiven}
                onChange={e => {
                  setConsentGiven(e.target.checked);
                  if (e.target.checked) setError('');
                }}
                required
                className="mt-1 h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="parent-consent-checkbox" className="text-xs text-stone-600 leading-snug cursor-pointer select-none">
                Confirmo que soy mayor de edad y que ostento la patria potestad o tutela legal de los menores que registraré en esta cuenta.
              </label>
            </div>
          </>
        ) : (
          <Input
            label="Nombre de vuestra familia"
            value={familyName}
            onChange={e => setFamilyName(e.target.value)}
            required
            placeholder="Los García, La familia Martínez..."
            hint="Este nombre lo verá toda la familia"
            autoFocus
          />
        )}

        {error && (
          <p className="text-sm text-red-600 text-center" role="alert">{error}</p>
        )}

        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          {step === 'account' ? 'Continuar' : 'Crear familia'}
        </Button>
      </form>

      <div className="mt-6 text-center flex flex-col gap-3">
        <Link href="/login" className="text-sm text-stone-400 hover:text-stone-600">
          Ya tengo cuenta
        </Link>
        <div className="pt-2 border-t border-stone-100">
          <Link
            href="/ayuda#registro"
            className="text-xs text-stone-500 hover:text-teal-800 transition-colors"
          >
            ¿Cómo funciona el registro? <span className="font-semibold text-teal-700 underline">Ver Guía Paso a Paso</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-stone-200 border-t-bloom-400 rounded-full animate-spin" /></div>}>
      <SignupForm />
    </Suspense>
  );
}

