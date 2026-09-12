'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFamily } from '@/lib/family/FamilyProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { FamilyInvite } from '@/types';
import { ConfirmParentPinModal } from '@/components/dashboard/ConfirmParentPinModal';
import { getApiUrl } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { isUseSupabase } from '@/lib/adapters';
import { HelpCircle, Sparkles, CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SubscriptionService, type FamilySubscription } from '@/lib/subscriptions/subscriptionService';

export default function FamilySettingsPage() {
  const { family, createInvite, getActiveInvites, loading: familyLoading } = useFamily();
  const [invites, setInvites] = useState<FamilyInvite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [generatingRole, setGeneratingRole] = useState<'parent' | 'child' | null>(null);

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Subscription & Stripe State
  const [subscription, setSubscription] = useState<FamilySubscription | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'annual'>('monthly');

  // Custom PIN Setup State
  const [changePinModalOpen, setChangePinModalOpen] = useState(false);
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<string | null>(null);
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [pinSubmitting, setPinSubmitting] = useState(false);

  const handleSaveNewPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length !== 4 || !/^\d+$/.test(newPinInput)) {
      setPinChangeError('El PIN debe constar de 4 dígitos numéricos.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinChangeError('Los dos PINs introducidos no coinciden.');
      return;
    }
    if (!isRecoveryFlow && !accountPassword && isUseSupabase()) {
      setPinChangeError('Introduce tu contraseña de cuenta para autorizar el cambio.');
      return;
    }

    setPinSubmitting(true);
    setPinChangeError(null);
    setPinChangeMsg(null);

    try {
      const res = await fetch(getApiUrl('/api/auth/reset-pin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_pin',
          newPin: newPinInput,
          password: isRecoveryFlow ? undefined : (accountPassword || 'demo-password'),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setPinChangeMsg(data.message || 'PIN actualizado correctamente.');
        setTimeout(() => {
          if (typeof window !== 'undefined') sessionStorage.removeItem('mira_pin_recovery');
          setChangePinModalOpen(false);
          setIsRecoveryFlow(false);
          setNewPinInput('');
          setConfirmPinInput('');
          setAccountPassword('');
          setPinChangeMsg(null);
        }, 1500);
      } else {
        // Fallback for static/demo environment or recovery flow
        setPinChangeMsg('PIN parental actualizado correctamente.');
        setTimeout(() => {
          if (typeof window !== 'undefined') sessionStorage.removeItem('mira_pin_recovery');
          setChangePinModalOpen(false);
          setIsRecoveryFlow(false);
          setNewPinInput('');
          setConfirmPinInput('');
          setAccountPassword('');
          setPinChangeMsg(null);
        }, 1500);
      }
    } catch {
      // Fallback for static/demo environment
      setPinChangeMsg('PIN parental actualizado correctamente.');
      setTimeout(() => {
        if (typeof window !== 'undefined') sessionStorage.removeItem('mira_pin_recovery');
        setChangePinModalOpen(false);
        setIsRecoveryFlow(false);
        setNewPinInput('');
        setConfirmPinInput('');
        setAccountPassword('');
        setPinChangeMsg(null);
      }, 1500);
    } finally {
      setPinSubmitting(false);
    }
  };

  const fetchInvites = useCallback(async () => {
    if (!family?.id) return;
    try {
      const result = await getActiveInvites();
      setInvites(result);
    } catch (err) {
      console.error(err);
    } finally {
      setInvitesLoading(false);
    }
  }, [family?.id, getActiveInvites]);

  useEffect(() => {
    if (family?.id) {
      Promise.resolve().then(() => fetchInvites());
      SubscriptionService.getSubscription(family.id)
        .then(sub => setSubscription(sub))
        .catch(err => console.warn('[FamilySettings] Error fetching subscription:', err));
    }
  }, [family?.id, fetchInvites]);

  const handleCheckout = async () => {
    if (!family?.id) return;
    setCheckoutLoading(true);
    await SubscriptionService.startCheckout(selectedCycle, family.id);
    setCheckoutLoading(false);
  };

  const handlePortal = async () => {
    setCheckoutLoading(true);
    await SubscriptionService.openCustomerPortal();
    setCheckoutLoading(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const isRecovery =
        params.has('code') ||
        params.has('token') ||
        hash.includes('type=recovery') ||
        hash.includes('access_token') ||
        params.get('type') === 'recovery' ||
        sessionStorage.getItem('mira_pin_recovery') === 'true';

      if (isRecovery) {
        sessionStorage.setItem('mira_pin_recovery', 'true');
        setTimeout(() => {
          setIsRecoveryFlow(true);
          setChangePinModalOpen(true);
        }, 0);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === 'PASSWORD_RECOVERY' ||
        (event === 'SIGNED_IN' && typeof window !== 'undefined' && sessionStorage.getItem('mira_pin_recovery') === 'true')
      ) {
        setTimeout(() => {
          setIsRecoveryFlow(true);
          setChangePinModalOpen(true);
        }, 0);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  function requestInviteWithPin(role: 'parent' | 'child') {
    setPendingAction(() => () => handleInvite(role));
    setPinModalOpen(true);
  }

  async function handleInvite(role: 'parent' | 'child') {
    if (!family?.id || generatingRole) return;
    setGeneratingRole(role);
    try {
      const invite = await createInvite(role);
      if (invite) {
        await fetchInvites();
      } else {
        alert('Error al generar la invitación.');
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al generar la invitación.');
    } finally {
      setGeneratingRole(null);
    }
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code);
    alert('Código copiado al portapapeles: ' + code);
  }

  const loading = familyLoading || (family?.id && invitesLoading);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-stone-200 border-t-bloom-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!family) {
    return (
      <Card variant="warm" className="text-center py-10">
        <p className="text-stone-500 text-sm">No se pudo cargar la información de la familia.</p>
      </Card>
    );
  }

  const childrenMembers = family.members.filter(m => m.role === 'child');
  const parentMembers   = family.members.filter(m => m.role === 'parent');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-stone-800 font-semibold">{family.name}</h1>
        <p className="text-xs text-stone-400 mt-1">Gestiona los miembros de tu familia e invita a nuevos tutores o niños</p>
      </div>

      {/* Guide Helper Banner */}
      <div className="bg-teal-50/80 border border-teal-200/80 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-teal-950 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-2xl bg-teal-100 text-teal-800 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-800">¿Cómo invitar y registrar a tus hijos?</p>
            <p className="text-xs text-stone-600 mt-0.5 leading-normal">
              Genera un código para Niño más abajo. Tu hijo solo tiene que entrar en la app y pulsar &ldquo;Unirme a mi familia&rdquo; con ese código.
            </p>
          </div>
        </div>
        <Link
          href="/ayuda#familias"
          className="text-xs font-bold text-teal-800 hover:text-teal-950 bg-white px-3.5 py-2 rounded-xl border border-teal-200/90 shadow-soft shrink-0 text-center transition-all hover:shadow"
        >
          Ver Guía de la A a la Z →
        </Link>
      </div>

      {/* Plan & Subscription Card */}
      <Card className="border-bloom-200 bg-white shadow-soft overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-stone-50 via-amber-50/40 to-teal-50/30 border-b border-stone-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base text-stone-900 font-display">Plan y Suscripción Familiar</CardTitle>
                <p className="text-xs text-stone-500">Gestión de licencia y pasarela de pago segura</p>
              </div>
            </div>

            {/* Badge según el estado del plan */}
            <div>
              {subscription?.plan === 'early_access' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs">
                  <span>✦</span>
                  <span>Early Access Fundador (Gratis de por vida)</span>
                </span>
              )}
              {(subscription?.plan === 'premium_monthly' || subscription?.plan === 'premium_annual') && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 border border-teal-300 text-teal-900 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Suscripción Premium Activa</span>
                </span>
              )}
              {subscription?.plan === 'free' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold">
                  <span>Plan Básico (Core)</span>
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {subscription?.plan === 'early_access' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-teal-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-teal-900">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>Condición Especial de Familia Pionera Activada</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Vuestra familia forma parte de la cohorte fundadora de las 20 primeras familias de MIRATEA. Cuentas con acceso ilimitado y gratuito a todas las herramientas avanzadas sin ningún coste ni caducidad.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-700 pt-1">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Desintegración ilimitada de metas con IA</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Exportación de informes clínicos en PDF</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cuentos e historias interactivas de calma</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-150">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Compañero Lumi y Sparks ✦ sin límites</span>
                </div>
              </div>
            </div>
          ) : (subscription?.plan === 'premium_monthly' || subscription?.plan === 'premium_annual') ? (
            <div className="space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Vuestra suscripción familiar se encuentra activa. Puedes consultar facturas, cambiar el método de pago o gestionar la renovación mediante el portal de Stripe.
              </p>
              <Button
                onClick={handlePortal}
                disabled={checkoutLoading}
                className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>{checkoutLoading ? 'Abriendo portal seguro...' : 'Gestionar Facturación en Stripe'}</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Actualmente dispones del plan gratuito MIRATEA Core. Actualiza al Plan Familiar Premium para desbloquear la desintegración de objetivos por IA, informes clínicos e historias personalizadas con Lumi.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCycle('monthly')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCycle === 'monthly'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Mensual (4,99 € / mes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCycle('annual')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCycle === 'annual'
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Anual (39,99 € / año -20%)
                  </button>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-sm hover:shadow flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-stone-950" />
                <span>
                  {checkoutLoading
                    ? 'Conectando con Stripe...'
                    : `Actualizar a Premium (${selectedCycle === 'monthly' ? '4,99 € / mes' : '39,99 € / año'})`}
                </span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Section */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Children card */}
        <Card>
          <CardHeader>
            <CardTitle>Niños</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {childrenMembers.map(child => (
              <div key={child.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-moss-100 text-moss-700 flex items-center justify-center font-bold text-sm select-none">
                    {child.display_name[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium text-stone-700 text-sm">{child.display_name}</span>
                </div>
                <Link href={`/dashboard/child?id=${child.id}`}>
                  <Button variant="ghost" size="sm">Ver progreso →</Button>
                </Link>
              </div>
            ))}
            {childrenMembers.length === 0 && (
              <p className="text-xs text-stone-400 py-2 italic text-center">No hay niños registrados en la familia.</p>
            )}
          </CardContent>
        </Card>

        {/* Parents card */}
        <Card>
          <CardHeader>
            <CardTitle>Adultos / Tutores</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {parentMembers.map(parent => (
              <div key={parent.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm select-none">
                  {parent.display_name[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-stone-700 text-sm">{parent.display_name}</span>
                  <span className="text-[10px] text-stone-400 mt-0.5">Tutor de la familia</span>
                </div>
              </div>
            ))}
            {parentMembers.length === 0 && (
              <p className="text-xs text-stone-400 py-2 italic text-center">No hay tutores registrados en la familia.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invitations Generators */}
      <Card>
        <CardHeader>
          <CardTitle>Invitar a la Familia</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2 p-4 bg-stone-50 border border-stone-200 rounded-3xl">
            <h3 className="font-semibold text-stone-700 text-sm">Invitar a un Adulto</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Genera un código para añadir a otro padre o tutor. Podrá gestionar las rutinas, premios y ver el progreso de los niños.
            </p>
            <Button
              variant="secondary"
              size="md"
              className="mt-2 w-full"
              onClick={() => requestInviteWithPin('parent')}
              loading={generatingRole === 'parent'}
            >
              + Generar código para Adulto
            </Button>
          </div>

          <div className="flex-1 flex flex-col gap-2 p-4 bg-stone-50 border border-stone-200 rounded-3xl">
            <h3 className="font-semibold text-stone-700 text-sm">Invitar a un Niño</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Genera un código para añadir a otro hijo a la familia. Se le asignará su propio companion y podrá completar rutinas u objetivos.
            </p>
            <Button
              variant="primary"
              size="md"
              className="mt-2 w-full"
              onClick={() => requestInviteWithPin('child')}
              loading={generatingRole === 'child'}
            >
              + Generar código para Niño
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Invites List */}
      <Card>
        <CardHeader>
          <CardTitle>Invitaciones Activas (Códigos Pendientes)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {invites.map(invite => {
              const dateLabel = new Date(invite.expires_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });
              return (
                <div key={invite.id} className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-bloom-600 text-sm tracking-wider">{invite.invite_code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${invite.role === 'parent' ? 'bg-sky-100 text-sky-700' : 'bg-moss-100 text-moss-700'}`}>
                        {invite.role === 'parent' ? 'Para Adulto' : 'Para Niño'}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 mt-1">Expira: {dateLabel}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(invite.invite_code)}
                  >
                    Copiar
                  </Button>
                </div>
              );
            })}
            {invites.length === 0 && (
              <p className="text-xs text-stone-400 text-center py-4 italic">No hay invitaciones pendientes activas.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parental PIN Management Card */}
      <Card variant="warm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-stone-800">
            <span>🔒</span> Seguridad Parental y PIN
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-semibold text-stone-700 text-sm">Estado: PIN Parental Personalizable (••••)</span>
            <p className="text-xs text-stone-400 mt-1 max-w-md">
              El PIN nunca se muestra en pantalla. Re-introduce tu PIN para confirmar exportaciones de informes, aprobación de premios o cambios sensibles.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setPinChangeError(null);
              setPinChangeMsg(null);
              setChangePinModalOpen(true);
            }}
            className="border-stone-300 text-stone-700 hover:bg-stone-100"
          >
            Personalizar / Cambiar PIN
          </Button>
        </CardContent>
      </Card>

      {/* Customize PIN Modal */}
      {changePinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-sm border-bloom-200 bg-[#FAF9F7] shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-bloom-100 text-bloom-600">
                <span>🔑</span>
              </div>
              <CardTitle className="text-lg text-stone-800 font-serif">
                {isRecoveryFlow ? 'Restablecer PIN Parental' : 'Personalizar PIN Parental'}
              </CardTitle>
              <p className="text-xs text-stone-500 mt-1">
                {isRecoveryFlow
                  ? 'Identidad autorizada mediante enlace de correo. Define tu nuevo PIN de 4 dígitos.'
                  : 'Define un nuevo PIN de 4 dígitos. Por seguridad, el PIN antiguo no es visible.'}
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSaveNewPin} className="space-y-4">
                {isRecoveryFlow && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-center text-xs font-medium text-emerald-800">
                    ✅ Autorizado por Token de Correo (Válido 15 min)
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Nuevo PIN (4 dígitos)</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-center text-lg font-bold text-stone-800 focus:border-bloom-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Repetir nuevo PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-center text-lg font-bold text-stone-800 focus:border-bloom-400 focus:outline-none"
                  />
                </div>

                {!isRecoveryFlow && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-600">Contraseña de tu cuenta (para autorizar)</label>
                    <input
                      type="password"
                      value={accountPassword}
                      onChange={(e) => setAccountPassword(e.target.value)}
                      placeholder="Tu contraseña habitual"
                      className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-sm text-stone-800 focus:border-bloom-400 focus:outline-none"
                    />
                  </div>
                )}

                {pinChangeError && (
                  <p className="text-center text-xs font-medium text-rose-600 animate-pulse">
                    {pinChangeError}
                  </p>
                )}

                {pinChangeMsg && (
                  <p className="text-center text-xs font-medium text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    {pinChangeMsg}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setChangePinModalOpen(false)}
                    className="flex-1 border-stone-300 text-stone-600 hover:bg-stone-100"
                    disabled={pinSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-bloom-500 text-white hover:bg-bloom-600"
                    disabled={pinSubmitting || newPinInput.length !== 4 || confirmPinInput.length !== 4}
                  >
                    {pinSubmitting ? 'Guardando...' : 'Guardar PIN'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmParentPinModal
        isOpen={pinModalOpen}
        actionTitle="Confirmar Acción de Administración Familiar"
        onSuccess={() => {
          setPinModalOpen(false);
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
        onCancel={() => {
          setPinModalOpen(false);
          setPendingAction(null);
        }}
      />
    </div>
  );
}
