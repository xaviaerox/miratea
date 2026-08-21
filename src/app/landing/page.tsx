'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MiraLogo } from '@/components/ui/MiraLogo';
import { LegalFooter } from '@/components/ui/LegalFooter';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  Sparkles,
  CheckCircle2,
  Zap,
  Smile,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isEarlyModalOpen, setIsEarlyModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    childAge: '8-10',
    neurodivergence: 'tea_tdah',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    trackEvent('pricing_viewed', { page: 'landing' });
  }, [trackEvent]);

  const handleSubmitEarlyFamily = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('early_family_signup', { ...formData, billingCycle });
    setSubmitted(true);
  };

  const handleDemoClick = () => {
    trackEvent('login', { mode: 'demo_click' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-stone-800 flex flex-col font-sans selection:bg-teal-100">
      {/* HEADER / NAVIGATION */}
      <header className="w-full border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <MiraLogo size="md" showText={true} />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-stone-700 hover:text-teal-800 px-3 py-2 rounded-xl transition-colors"
            >
              Iniciar Sesión
            </Link>
            <button
              onClick={() => setIsEarlyModalOpen(true)}
              className="text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Probar MIRATEA</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Programa Early Families — Plazas Limitadas</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-stone-900 tracking-tight leading-[1.15]">
            Menos recordatorios. <br />
            <span className="text-teal-700 underline decoration-amber-300 decoration-wavy decoration-2">
              Más autonomía.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
            MIRATEA ayuda a los niños a convertir sus rutinas y objetivos en un camino de progreso personal, con un compañero digital que crece con ellos y recompensas que dan valor al esfuerzo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleDemoClick}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-base shadow-lg shadow-teal-900/10 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Entrar / Probar Demo 1-Clic</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsEarlyModalOpen(true)}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-semibold text-base shadow-sm transition-all"
            >
              Oferta Early Family (30 días)
            </button>
          </div>

          {/* BADGES OF CONFIDENCE */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-stone-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sin Rachas Punitivas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sin Competición ni Ránkings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Protección PII pre-IA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Neurodiversity-First</span>
            </div>
          </div>
        </div>
      </section>

      {/* EL PROBLEMA VS LA SOLUCIÓN */}
      <section className="py-16 px-4 bg-white border-y border-stone-200/70">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="p-8 rounded-3xl bg-amber-50/60 border border-amber-200/70 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
              ✕
            </div>
            <h3 className="text-xl font-bold text-stone-900">La batalla cotidiana sin MIRATEA</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Repetir las mismas instrucciones cada mañana, negociar cada tarea, lidiar con la sobreestimulación y sentir que las rutinas se convierten en un conflicto constante entre padres e hijos.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-teal-50/60 border border-teal-200/70 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-stone-900">El recorrido de progreso con MIRATEA</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Estructura visual clara, un compañero personal que evoluciona con cada paso y Sparks ✦ que transforman el esfuerzo cotidiano en recompensas familiares reales sin presión.
            </p>
          </div>
        </div>
      </section>

      {/* LOS TRES PILARES COMERCIALES */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-stone-900">
            Los Tres Pilares de MIRATEA
          </h2>
          <p className="text-base text-stone-600">
            Una experiencia diseñada para conectar motivación, estructura y vínculo familiar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* PILAR 1: COMPAÑERO */}
          <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Smile className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">1. El Compañero (Lumi)</h3>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Crece contigo</p>
            <p className="text-sm text-stone-600 leading-relaxed">
              Un compañero digital inmutable que evoluciona con el esfuerzo del niño. Jamás sufre regresión de nivel ni abandono si un día cuesta más avanzar.
            </p>
          </div>

          {/* PILAR 2: RUTINAS */}
          <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">2. Rutinas Adaptativas</h3>
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Sabe qué hacer</p>
            <p className="text-sm text-stone-600 leading-relaxed">
              Tableros visuales de microtareas claras, marcables y libres de ansiedad. Sin contadores de días ni amenazas de romper la racha.
            </p>
          </div>

          {/* PILAR 3: SPARKS */}
          <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">3. Sparks ✦ & Recompensas</h3>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Tu esfuerzo tiene valor</p>
            <p className="text-sm text-stone-600 leading-relaxed">
              Economía afirmativa donde el niño acumula Sparks ✦ por sus logros y propone recompensas familiares validadas por los padres en 1-clic.
            </p>
          </div>
        </div>
      </section>

      {/* CICLO DE VALOR INFOGRÁFICO */}
      <section className="py-16 px-4 bg-teal-900 text-white">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-3xl font-display font-extrabold text-teal-100">
            El Ciclo del Valor en MIRATEA
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold">
            <span className="bg-teal-800/80 px-4 py-2 rounded-xl border border-teal-700">Tarea Real</span>
            <span className="text-teal-400">→</span>
            <span className="bg-teal-800/80 px-4 py-2 rounded-xl border border-teal-700">Esfuerzo</span>
            <span className="text-teal-400">→</span>
            <span className="bg-amber-400 text-stone-900 px-4 py-2 rounded-xl font-bold">Sparks ✦</span>
            <span className="text-teal-400">→</span>
            <span className="bg-teal-800/80 px-4 py-2 rounded-xl border border-teal-700">Ahorro</span>
            <span className="text-teal-400">→</span>
            <span className="bg-teal-800/80 px-4 py-2 rounded-xl border border-teal-700">Recompensa</span>
            <span className="text-teal-400">→</span>
            <span className="bg-teal-800/80 px-4 py-2 rounded-xl border border-teal-700">Autonomía</span>
          </div>
        </div>
      </section>

      {/* PRICING & EARLY FAMILY OFFER */}
      <section className="py-20 px-4 max-w-5xl mx-auto" id="pricing">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-stone-900">
            Planes y Oferta Early Family
          </h2>
          <p className="text-sm text-stone-600">
            Paga solo si MIRATEA aporta valor real a vuestro día a día.
          </p>

          <div className="inline-flex items-center p-1 bg-stone-200/70 rounded-xl mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'annual' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
              }`}
            >
              Anual (-20% Descuento)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* PLAN GRATUITO */}
          <div className="bg-white p-8 rounded-3xl border border-stone-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-stone-900">MIRATEA Core</h3>
              <p className="text-xs text-stone-500">Gratuito para siempre</p>
              <p className="text-3xl font-extrabold text-stone-900">0 €</p>
              <ul className="space-y-2.5 text-xs text-stone-600 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Tableros de Rutinas diarios</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Compañero Lumi básico</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Rincón de Calma (Box Breathing 432Hz)</span>
                </li>
              </ul>
            </div>
            <button
              onClick={handleDemoClick}
              className="w-full py-3.5 rounded-xl border border-stone-300 font-semibold text-sm hover:bg-stone-50 transition-colors"
            >
              Probar Versión Gratuita
            </button>
          </div>

          {/* PLAN EARLY FAMILY */}
          <div className="bg-teal-900 text-white p-8 rounded-3xl border-2 border-amber-300 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-400 text-stone-900 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Garantía Fundadora
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-teal-100">MIRATEA Early Family</h3>
              <p className="text-xs text-teal-200">Experimento de Pricing Fundador</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-extrabold text-white">
                  {billingCycle === 'monthly' ? '4,99 €' : '3,99 €'}
                </p>
                <span className="text-xs text-teal-200">/ mes</span>
              </div>
              <ul className="space-y-2.5 text-xs text-teal-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Todo lo de MIRATEA Core</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>IA para desintegración de objetivos complejos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Informes Terapéuticos en PDF exportables</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Cuentos e historias interactivas con Lumi</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setIsEarlyModalOpen(true)}
              className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm shadow-md transition-all"
            >
              Solicitar Plaza Early Family
            </button>
          </div>
        </div>
      </section>

      {/* ACCORDEÓN FAQ */}
      <section className="py-16 px-4 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 text-center mb-8">
          Preguntas Frecuentes
        </h2>

        <div className="space-y-3">
          {[
            {
              q: '¿Cómo funciona la desintegración de objetivos con IA?',
              a: 'El niño o la familia introducen una meta grande (ej. "ordenar mi cuarto"). Nuestra IA la descompone en 3 micropasos manejables. Antes de enviar los datos, nuestro middleware PiiSanitizer anonimiza el contenido sustituyendo los nombres reales.',
            },
            {
              q: '¿Por qué MIRATEA no incluye contadores de rachas?',
              a: 'Las rachas continuas generan ansiedad y rechazo cuando un día no se pueden completar las tareas. MIRATEA celebra el esfuerzo de forma acumulativa sin castigos ni reinicios.',
            },
            {
              q: '¿Se pueden exportar los datos para terapeutas o psicólogos?',
              a: 'Sí. El perfil parental puede generar y descargar informes en PDF, CSV o JSON con el registro de emociones y rutinas desde el panel de ajustes.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="border border-stone-200 rounded-2xl bg-white overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-semibold text-stone-900 flex items-center justify-between gap-4 text-sm"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-stone-400 transition-transform ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* MODAL SOLICITUD EARLY FAMILIES */}
      {isEarlyModalOpen && (
        <div className="fixed inset-0 bg-stone-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsEarlyModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 text-lg font-bold"
            >
              ✕
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmitEarlyFamily} className="space-y-4">
                <div className="flex items-center gap-2 text-teal-800">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-xl font-bold font-display">Solicitar Acceso Early Family</h3>
                </div>
                <p className="text-xs text-stone-600">
                  Únete a la cohorte fundadora (10-20 familias) con condiciones especiales de precio vitalicio.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Tu Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Ej. María López"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Email de Contacto</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Edad del Niño/a</label>
                  <select
                    value={formData.childAge}
                    onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="5-7">5 - 7 años</option>
                    <option value="8-10">8 - 10 años</option>
                    <option value="11-14">11 - 14 años</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all mt-2"
                >
                  Confirmar Solicitud
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
                <h3 className="text-xl font-bold text-stone-900">¡Solicitud Recibida!</h3>
                <p className="text-xs text-stone-600">
                  Te contactaremos en las próximas 24h a <strong>{formData.email}</strong> para daros acceso a la cohorte Early Family.
                </p>
                <button
                  onClick={() => setIsEarlyModalOpen(false)}
                  className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <LegalFooter />
    </div>
  );
}
