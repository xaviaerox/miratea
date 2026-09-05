'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const GUIDE_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'rutinas',
    question: '¿Qué ocurre si mi hijo o hija no completa una rutina o pasan varios días sin usar la app?',
    answer:
      '¡Absolutamente nada! MIRATEA está estrictamente diseñada sin mecánicas de castigo ni contadores de rachas destructivas ("streaks"). Lumi nunca pierde nivel, nunca se enfada ni muestra tristeza por inactividad. Mañana siempre es un lienzo limpio para empezar con calma.',
  },
  {
    id: 'faq-2',
    category: 'familias',
    question: '¿Pueden dos padres o tutores gestionar a los mismos hijos?',
    answer:
      'Sí. El primer tutor que crea la familia puede ir a "Familia" en su panel parental y generar un código de invitación para "Adulto / Tutor". El segundo adulto solo tiene que registrarse con ese código y ambos compartirán la visión y gestión de los mismos hijos.',
  },
  {
    id: 'faq-3',
    category: 'familias',
    question: '¿Cómo conecto el dispositivo o tablet de mi hijo a nuestra familia?',
    answer:
      'Desde tu panel parental en "Familia", pulsa "+ Generar código para Niño". Obtendrás un código alfanumérico de 8 caracteres. Luego, en el dispositivo de tu hijo, abre MIRATEA, pulsa "Unirme a mi familia" (o accede a /join), introduce el código y su nombre. ¡Quedará vinculado al instante!',
  },
  {
    id: 'faq-4',
    category: 'sparks',
    question: '¿Qué son las Sparks ✦ y cómo se canjean los premios?',
    answer:
      'Las Sparks ✦ son la moneda afirmativa de MIRATEA. Los niños proponen los deseos o actividades que les gustaría conseguir desde su catálogo. Tú, como padre o madre, recibes la propuesta en tu panel, la apruebas y asignas el coste exacto en Sparks mediante un modal de 1-clic protegido por tu PIN. Al completar tareas y reunir las Sparks necesarias, el menor las canjea alegremente.',
  },
  {
    id: 'faq-5',
    category: 'seguridad',
    question: '¿Qué datos de mi familia se envían a servicios de Inteligencia Artificial?',
    answer:
      'Ningún dato personal identificable (Zero-PII). Antes de consultar al motor de IA para desintegrar un objetivo complejo, nuestro middleware de seguridad "PiiSanitizer" sustituye automáticamente el nombre real del niño y los datos familiares por marcadores opacos como [CHILD_NAME]. Toda la información sensible permanece protegida en tu dispositivo y bajo cifrado seguro.',
  },
  {
    id: 'faq-6',
    category: 'seguridad',
    question: '¿Para qué sirve el PIN Parental y qué pasa si lo olvido?',
    answer:
      'El PIN de 4 dígitos protege zonas delicadas: autorizar la generación de códigos para nuevos miembros, aprobar premios y exportar informes terapéuticos en PDF. Si lo olvidas, puedes restablecerlo verificando la contraseña de tu cuenta parental desde la sección "Seguridad Parental y PIN" en Familia.',
  },
  {
    id: 'faq-7',
    category: 'accesibilidad',
    question: '¿Cómo activo la tipografía para dislexia o reduzco las animaciones?',
    answer:
      'Ambas opciones residen unificadas en la Pestaña de Ajustes (Tab 5 / Perfil). Desde allí puedes activar con un solo toque la fuente adaptada OpenDyslexic y el modo "Menos Efectos y Animaciones" para evitar cualquier sobrecarga sensorial.',
  },
];

interface GuideFaqProps {
  filterCategory?: string;
}

export function GuideFaq({ filterCategory }: GuideFaqProps) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ 'faq-1': true });

  const toggle = (id: string) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = filterCategory && filterCategory !== 'todos' && filterCategory !== 'faq'
    ? GUIDE_FAQS.filter(faq => faq.category === filterCategory)
    : GUIDE_FAQS;

  if (filteredFaqs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {filteredFaqs.map(faq => {
        const isOpen = !!openIds[faq.id];

        return (
          <div
            key={faq.id}
            className="bg-white rounded-2xl border border-stone-200/90 shadow-soft overflow-hidden transition-all"
          >
            <button
              onClick={() => toggle(faq.id)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-stone-50/80 transition-colors cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-stone-800 text-sm md:text-base">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-teal-700' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-4 pt-1 text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/40 animate-fade-in">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
