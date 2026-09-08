'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MiraLogo } from '@/components/ui/MiraLogo';
import { LegalFooter } from '@/components/ui/LegalFooter';
import { GuideNav } from '@/components/help/GuideNav';
import { GuideStepCard } from '@/components/help/GuideStepCard';
import { GuideFaq } from '@/components/help/GuideFaq';
import { useAuth } from '@/lib/auth/AuthProvider';
import {
  UserPlus,
  Users,
  Sparkles,
  CheckCircle2,
  Target,
  Award,
  Heart,
  ShieldCheck,
  Glasses,
  HelpCircle,
  ArrowLeft,
  Search,
  BookOpen,
  MessageSquare,
  Lock,
  ExternalLink,
} from 'lucide-react';

export default function AyudaPage() {
  const { session } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const backUrl = session
    ? session.profile.role === 'parent'
      ? '/dashboard'
      : '/home'
    : '/landing';

  const backLabel = session
    ? session.profile.role === 'parent'
      ? 'Volver al Panel'
      : 'Volver al Inicio'
    : 'Volver a Bienvenida';

  const isVisible = (catId: string, keywords = '') => {
    const matchesCategory = activeCategory === 'todos' || activeCategory === catId;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return catId.includes(q) || keywords.toLowerCase().includes(q);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-stone-800 flex flex-col font-sans selection:bg-teal-100">
      {/* HEADER */}
      <header className="w-full border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href={backUrl} className="flex items-center gap-2">
              <MiraLogo size="sm" showText={true} />
            </Link>
            <span className="text-stone-300 hidden sm:inline">|</span>
            <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60 hidden sm:inline-flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              Guía de la A a la Z
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={backUrl}
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-stone-600 hover:text-teal-800 px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backLabel}</span>
            </Link>

            <a
              href="mailto:xavi@miratea.es?subject=Consulta%20sobre%20MIRATEA"
              className="text-xs sm:text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-200" />
              <span className="hidden xs:inline">Contacto</span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-teal-900/5 via-stone-100/40 to-transparent border-b border-stone-200/60 py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 shadow-soft">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Acompañamiento Afirmativo y sin Ansiedad</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-display font-bold text-stone-900 tracking-tight">
            Guía de MIRATEA para Familias: De la A a la Z
          </h1>

          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Tu manual paso a paso para configurar tu hogar, invitar a tus hijos, establecer rutinas visuales amables y entender cómo funciona cada rincón de MIRATEA.
          </p>

          {/* QUICK SEARCH BAR */}
          <div className="pt-2 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar tema (ej. invitar hijo, premios, PIN, Lumi...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/40 shadow-soft"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* STICKY NAV FILTERS */}
      <div className="sticky top-[57px] sm:top-[65px] z-40 bg-[#FAF9F7]/95 backdrop-blur-md border-b border-stone-200/80 py-2.5">
        <div className="max-w-5xl mx-auto px-4">
          <GuideNav
            activeCategory={activeCategory}
            onSelectCategory={catId => setActiveCategory(catId)}
          />
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 space-y-12">
        {/* SECCIÓN 1: FILOSOFÍA Y VALORES */}
        {isVisible('filosofia', 'filosofia valores tea tdah autismo neurodivergente no streaks rachas castigo lumi calma incondicional') && (
          <section id="filosofia" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-stone-800">
                  1. Filosofía de MIRATEA y Enfoque Neurodivergente
                </h2>
                <p className="text-xs text-stone-500">Diseñado desde el respeto neurológico y la calma</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft space-y-4">
              <p className="text-sm text-stone-700 leading-relaxed">
                MIRATEA es un entorno seguro para personas en el <strong>Espectro Autista (TEA), TDAH, Altas Capacidades y sus familias</strong>. A diferencia de las aplicaciones tradicionales de productividad infantil, MIRATEA descansa sobre <strong>tres pilares inmutables</strong>:
              </p>

              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-stone-200/80 space-y-1.5">
                  <span className="text-xl">🚫</span>
                  <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide">Cero Punición</h3>
                  <p className="text-xs text-stone-600 leading-normal">
                    Sin contadores de rachas destructivas (*streaks*). Si un día no se completa una tarea, mañana es un lienzo limpio sin reproches ni penalizaciones.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-stone-200/80 space-y-1.5">
                  <span className="text-xl">🛡️</span>
                  <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide">Compañero Incondicional</h3>
                  <p className="text-xs text-stone-600 leading-normal">
                    Lumi nunca pierde nivel, nunca se entristece ni muestra abandono. Su función es acompañar y ser un ancla de confianza afectiva.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-stone-200/80 space-y-1.5">
                  <span className="text-xl">🌿</span>
                  <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide">Calma Sensorial</h3>
                  <p className="text-xs text-stone-600 leading-normal">
                    Paleta de colores suave (#FAF9F7), tipografía adaptada, sin sonidos estridentes ni elementos que generen sobrecarga o urgencia innecesaria.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 2: REGISTRO PARENTAL */}
        {isVisible('registro') && (
          <section id="registro" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-stone-800">
                  2. Registro Parental y Primeros Pasos
                </h2>
                <p className="text-xs text-stone-500">Cómo dar de alta tu cuenta y ponerle nombre a vuestro hogar</p>
              </div>
            </div>

            <div className="space-y-3">
              <GuideStepCard
                stepNumber={1}
                actor="parent"
                title="Acceder al Registro Parental"
                description="Entra en la sección de registro para adultos o tutores legales."
                details={[
                  'Dirígete a /signup o pulsa "Probar MIRATEA" desde la página de inicio.',
                  'Introduce tu nombre de tutor o adulto responsable.',
                  'Aporta tu correo electrónico y define una contraseña segura de al menos 8 caracteres.',
                ]}
              />

              <GuideStepCard
                stepNumber={2}
                actor="parent"
                title="Consentimiento Legal Reforzado (RGPD / COPPA)"
                description="Antes de avanzar, deberás marcar la casilla de verificación confirmando tu mayoría de edad y tutela legal sobre los menores de la unidad familiar."
                tip="Este paso garantiza el cumplimiento estricto de la normativa de protección de datos infantiles. Ningún menor puede registrarse de forma autónoma sin el aval del tutor."
              />

              <GuideStepCard
                stepNumber={3}
                actor="parent"
                title="Bautizar el Espacio Familiar"
                description="Elige un nombre para vuestro hogar (por ejemplo: 'Familia García' o 'La Nave de Lucas')."
                details={[
                  'Este nombre identificará el espacio compartido en el que convivirán las rutinas y objetivos.',
                  'Al completar este paso, accederás automáticamente a tu Panel Parental (/dashboard).',
                ]}
              />

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-teal-900">
                <div>
                  <span className="font-bold">¿Quieres probar sin registrarte todavía?</span>
                  <p className="text-teal-700 mt-0.5">
                    Puedes pulsar &ldquo;Modo Demo 1-Clic&rdquo; en la pantalla de inicio de sesión para explorar toda la aplicación al instante con datos de ejemplo en memoria.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-3.5 py-2 rounded-xl shrink-0 text-center transition-colors"
                >
                  Ir al Acceso Demo →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 3: FAMILIAS E HIJOS */}
        {isVisible('familias') && (
          <section id="familias" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-stone-800">
                  3. Gestión Familiar y Conexión de Hijos
                </h2>
                <p className="text-xs text-stone-500">Cómo vincular a otros tutores y a los dispositivos de los niños</p>
              </div>
            </div>

            <div className="space-y-3">
              <GuideStepCard
                stepNumber={1}
                actor="parent"
                title="Generar el Código de Invitación para el Hijo"
                description="Desde tu Panel Parental, ve a la pestaña 'Familia' (/dashboard/family)."
                details={[
                  'Busca la sección "Invitar a la Familia" y haz clic en "+ Generar código para Niño".',
                  'Se solicitará tu PIN Parental de 4 dígitos para confirmar la acción segura.',
                  'Obtendrás un código alfanumérico exclusivo de 8 caracteres (ej. ABCD1234) válido durante 7 días.',
                ]}
                tip="Puedes generar códigos individuales para cada uno de tus hijos si tienes más de uno."
              />

              <GuideStepCard
                stepNumber={2}
                actor="child"
                title="Conectar el Dispositivo del Menor"
                description="En la tablet, móvil o navegador que utilizará el niño, abre MIRATEA."
                details={[
                  'En la pantalla inicial, pulsa en "Unirme a mi familia" (o visita directamente /join).',
                  'El niño introduce el código de 8 caracteres que le facilitaste.',
                  'Escribe su nombre o alias preferido y, opcionalmente, su año de nacimiento.',
                ]}
              />

              <GuideStepCard
                stepNumber={3}
                actor="child"
                title="Onboarding Infantil y Selección de Lumi"
                description="Al validar el código, el menor entra en el asistente sensorial de bienvenida."
                details={[
                  'Conocerá a Lumi y podrá elegir su apariencia inicial y su mundo temático favorito.',
                  'A partir de ese momento, su perfil quedará vinculado de por vida a tu espacio familiar.',
                ]}
              />

              <GuideStepCard
                stepNumber={4}
                actor="parent"
                title="Invitar a un Segundo Adulto o Terapeuta"
                description="Si deseas que otra persona (pareja, abuelo o terapeuta) tenga acceso parental:"
                details={[
                  'En /dashboard/family, pulsa "+ Generar código para Adulto".',
                  'El segundo tutor accede a /join con ese código y dispondrá de acceso a los informes y rutinas de la familia.',
                ]}
              />
            </div>
          </section>
        )}

        {/* SECCIÓN 4: COMPAÑERO LUMI */}
        {isVisible('lumi') && (
          <section id="lumi" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-stone-800">
                  4. El Compañero Digital Lumi
                </h2>
                <p className="text-xs text-stone-500">Un amigo incondicional que celebra logros sin juzgar descansos</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-amber-100/70 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-inner shrink-0 animate-gentle-float">
                  🌟
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-base font-bold text-stone-800">¿Quién es Lumi?</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Lumi es la estrella guía de MIRATEA. Nació para ofrecer a los niños una presencia comprensiva en sus retos cotidianos. Lumi habla en un tono cercano, sereno y libre de órdenes autoritarias.
                  </p>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-4 grid sm:grid-cols-2 gap-3 text-xs text-stone-600">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70">
                  <strong className="text-stone-800 block mb-1">✦ El Armario de Lumi</strong>
                  Los niños pueden personalizar su compañero desde la pestaña de Ajustes (Armario), eligiendo colores y estilos según su estado de ánimo.
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70">
                  <strong className="text-stone-800 block mb-1">✦ Mundos Temáticos</strong>
                  Pueden ambientar la aplicación con diferentes mundos (El Bosque Tranquilo, La Galaxia de Cristal, El Océano Sereno), adaptando los tonos a su comodidad sensorial.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 5: RUTINAS VISUALES */}
        {isVisible('rutinas') && (
          <section id="rutinas" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-stone-800">
                  5. Rutinas Visuales sin Ansiedad
                </h2>
                <p className="text-xs text-stone-500">Estructura predecible para el despertar, el colegio y el descanso</p>
              </div>
            </div>

            <div className="space-y-3">
              <GuideStepCard
                stepNumber={1}
                actor="parent"
                title="Crear una Nueva Rutina"
                description="Desde tu panel de control, accede a 'Rutinas' y haz clic en '+ Nueva rutina'."
                details={[
                  'Asigna un título comprensible (ej. "Rutina de Mañana", "Preparar la Mochila", "Hora de Dormir").',
                  'Selecciona qué hijo o hijos seguirán esta rutina mediante el selector múltiple.',
                  'Añade los pasos ordenados con pictogramas claros y tiempos estimados amables.',
                ]}
              />

              <GuideStepCard
                stepNumber={2}
                actor="child"
                title="Seguimiento Visual en el Dispositivo del Niño"
                description="El niño verá su rutina de hoy en la pantalla de inicio con tarjetas grandes y claras."
                details={[
                  'Puede marcar cada paso conforme lo completa con un toque suave.',
                  'Las animaciones son pausadas y sin fuegos artificiales abrumadores.',
                  'Cada paso completado suma puntos de constancia y bienestar emocional.',
                ]}
                tip="Si el niño necesita pausar la rutina para regularse, puede hacerlo sin prisas. No hay temporizadores agresivos con sonidos de alarma."
              />
            </div>
          </section>
        )}

        {/* SECCIÓN 6: METAS CON IA */}
        {isVisible('metas') && (
          <section id="metas" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-stone-800">
                  6. Objetivos y Desintegrador de Metas con IA
                </h2>
                <p className="text-xs text-stone-500">Transformar tareas abrumadoras en micropasos digeribles</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft space-y-4">
              <p className="text-sm text-stone-700 leading-relaxed">
                Para una mente neurodivergente, una meta como <em>&ldquo;Ordenar la habitación&rdquo;</em> o <em>&ldquo;Estudiar para el examen de cono&rdquo;</em> puede provocar parálisis por sobrecarga ejecutiva. El <strong>Desintegrador de Metas de Lumi</strong> resuelve esto de forma brillante:
              </p>

              <div className="space-y-3">
                <GuideStepCard
                  stepNumber={1}
                  actor="both"
                  title="Definir el Gran Objetivo"
                  description="En la sección 'Objetivos', pulsa '+ Nuevo objetivo' e introduce la meta global."
                />
                <GuideStepCard
                  stepNumber={2}
                  actor="parent"
                  title="Desintegración Inteligente en 2 a 6 Micropasos"
                  description="Pulsa el botón 'Desintegrar con Lumi'. Nuestro motor pedagógico analiza la meta y la divide en pequeños pasos lógicos y manejables."
                  details={[
                    'Ejemplo: 1) Recoger la ropa del suelo. 2) Colocar los libros en la mesa. 3) Guardar los juguetes en el baúl.',
                    'Puedes editar, añadir o suprimir pasos antes de confirmar la aventura.',
                  ]}
                  tip="La anonimización Zero-PII se aplica automáticamente: ningún nombre ni dato sensible viaja al servidor de IA."
                />
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 7: SPARKS Y PREMIOS */}
        {isVisible('sparks') && (
          <section id="sparks" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-stone-800">
                  7. Sparks ✦ y el Catálogo de Premios
                </h2>
                <p className="text-xs text-stone-500">Motivación positiva acordada en familia sin chantajes</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900">
                <strong>✦ Denominación Oficial:</strong> La moneda de MIRATEA se denomina SIEMPRE <strong>Sparks</strong> (o <strong>Sparks ✦</strong>). No empleamos términos genéricos como &ldquo;chispas&rdquo; ni &ldquo;monedas&rdquo;.
              </div>

              <GuideStepCard
                stepNumber={1}
                actor="child"
                title="El Menor Propone un Deseo o Premio"
                description="Desde su catálogo de recompensas, el niño puede seleccionar un premio propuesto o añadir una idea propia."
                details={[
                  'Puede ser un premio tangible (ej. un libro de dinosaurios) o una actividad compartida (ej. ir al cine con papá, tarde de repostería).',
                  'El niño puede sugerir una estimación de Sparks opcional.',
                ]}
              />

              <GuideStepCard
                stepNumber={2}
                actor="parent"
                title="Aprobación Parental en 1-Clic con PIN"
                description="La propuesta llega directamente al panel del adulto en /dashboard/rewards."
                details={[
                  'El padre o madre revisa la solicitud y asigna el valor exacto en Sparks en un modal de 1-clic.',
                  'No es necesario borrar ni recrear el premio: todo se gestiona de forma fluida.',
                  'La acción se autoriza mediante el PIN parental para evitar manipulaciones no supervisadas.',
                ]}
              />

              <GuideStepCard
                stepNumber={3}
                actor="child"
                title="Canje Alegre de Sparks"
                description="A medida que completa sus rutinas y metas, el niño acumula Sparks ✦ en su saldo. Al alcanzar el valor, desbloquea su premio con una celebración afirmativa."
              />
            </div>
          </section>
        )}

        {/* SECCIÓN 8: CALMA Y SALUD EMOCIONAL */}
        {isVisible('calma') && (
          <section id="calma" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-stone-800">
                  8. Rincón de Calma y Salud Emocional
                </h2>
                <p className="text-xs text-stone-500">Herramientas de autorregulación sensorial y registro evolutivo</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                    <span>🫁</span>
                    <span>Box Breathing (4-4-4-4)</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Dinámica de respiración cuadrada guiada visualmente: 4s inhalar, 4s retener, 4s exhalar, 4s reposar. Acompañada de ondas armónicas a 432Hz sintetizadas directamente por el navegador mediante la Web Audio API.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
                    <span>💭</span>
                    <span>Registro &ldquo;Cómo estoy&rdquo;</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Check-in emocional diario: el menor registra su nivel de energía y su emoción actual, junto a factores desencadenantes (ruido, cansancio, cambios imprevistos) de forma cualitativa y sin juicios de valor.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1.5">
                <strong className="text-stone-800 block text-sm">✦ Informes para Terapeutas y Profesionales:</strong>
                <p>
                  Desde el panel parental puedes exportar resúmenes semanales y mensuales en formato <strong>PDF oficial, CSV y JSON</strong>, listos para compartir en consultas de psicología, neuropediatría o terapia ocupacional.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 9: SEGURIDAD Y PIN */}
        {isVisible('seguridad') && (
          <section id="seguridad" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-stone-800">
                  9. Seguridad, PIN Parental y Privacidad Zero-PII
                </h2>
                <p className="text-xs text-stone-500">Blindaje de datos de menores y control exclusivo de los adultos</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-stone-600 space-y-1">
                    <strong className="text-stone-800 text-sm block">El PIN Parental de 4 Dígitos</strong>
                    <p>
                      El PIN actúa como candado frente a acciones sensibles: generar invitaciones para nuevos miembros, aprobar premios con Sparks y descargar informes médicos. Nunca se muestra en pantalla y puedes cambiarlo desde la sección Familia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-stone-100 pt-3">
                  <div className="p-2 rounded-xl bg-teal-100 text-teal-800 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-stone-600 space-y-1">
                    <strong className="text-stone-800 text-sm block">Arquitectura Zero-PII</strong>
                    <p>
                      Los nombres reales de los menores nunca viajan a modelos de lenguaje o servidores externos. Nuestro filtro de sanitización <code>PiiSanitizer</code> enmascara cualquier dato identificativo antes de cualquier llamada externa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 10: ACCESIBILIDAD */}
        {isVisible('accesibilidad') && (
          <section id="accesibilidad" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                <Glasses className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-stone-800">
                  10. Accesibilidad Sensorial Adaptada
                </h2>
                <p className="text-xs text-stone-500">Opciones unificadas en la Pestaña de Ajustes (Tab 5 / Perfil)</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-soft space-y-4">
              <p className="text-sm text-stone-700 leading-relaxed">
                Para mantener las cabeceras limpias y no sobrecargar la vista del niño, todas las opciones de accesibilidad se concentran en la <strong>Pestaña de Ajustes (Tab 5 / Perfil)</strong>:
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <strong className="text-stone-800 text-xs block uppercase">Tipografía OpenDyslexic</strong>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Facilita la lectura a niños y adultos con dislexia o dificultades de discriminación de caracteres aumentando el peso en la base de cada letra.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <strong className="text-stone-800 text-xs block uppercase">Menos Efectos y Animaciones</strong>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Desactiva transiciones y movimientos flotantes para usuarios con sensibilidad visual o vestibular, reduciendo estímulos innecesarios.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 11: PREGUNTAS FRECUENTES (FAQ) */}
        {isVisible('faq') && (
          <section id="faq" className="space-y-4 scroll-mt-28">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-bloom-100 text-bloom-800">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-stone-800">
                  11. Preguntas Frecuentes (FAQ)
                </h2>
                <p className="text-xs text-stone-500">Respuestas directas a las dudas habituales de las familias</p>
              </div>
            </div>

            <GuideFaq filterCategory={activeCategory} />
          </section>
        )}

        {/* HELP FOOTER CALLOUT */}
        <div className="bg-teal-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-800/80 text-amber-300">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">¿Tienes alguna duda no resuelta en la guía?</h3>
              <p className="text-xs sm:text-sm text-teal-200/90">
                Estamos aquí para acompañar a tu familia en cada paso del camino.
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
            Si encuentras alguna dificultad con los códigos de invitación, tienes una sugerencia pedagógica o necesitas soporte directo, puedes escribirnos libremente.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="mailto:xavi@miratea.es?subject=Soporte%20Familia%20MIRATEA"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <span>Escribir a Soporte (xavi@miratea.es)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              href={backUrl}
              className="bg-teal-800 hover:bg-teal-700 text-teal-100 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              {backLabel}
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <LegalFooter />
    </div>
  );
}
