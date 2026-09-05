'use client';

import React from 'react';
import {
  Compass,
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
} from 'lucide-react';

export interface GuideCategory {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const GUIDE_CATEGORIES: GuideCategory[] = [
  { id: 'todos', label: 'Todo', icon: Compass },
  { id: 'filosofia', label: 'Filosofía y Valores', icon: Heart },
  { id: 'registro', label: 'Registro Parental', icon: UserPlus },
  { id: 'familias', label: 'Familias e Hijos', icon: Users },
  { id: 'lumi', label: 'Compañero Lumi', icon: Sparkles },
  { id: 'rutinas', label: 'Rutinas Visuales', icon: CheckCircle2 },
  { id: 'metas', label: 'Metas con IA', icon: Target },
  { id: 'sparks', label: 'Sparks ✦ y Premios', icon: Award },
  { id: 'calma', label: 'Rincón de Calma', icon: Heart },
  { id: 'seguridad', label: 'Seguridad y PIN', icon: ShieldCheck },
  { id: 'accesibilidad', label: 'Accesibilidad', icon: Glasses },
  { id: 'faq', label: 'Preguntas Frecuentes', icon: HelpCircle },
];

interface GuideNavProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export function GuideNav({ activeCategory, onSelectCategory }: GuideNavProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-2 min-w-max">
        {GUIDE_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap
                ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-700/20'
                    : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-800 border border-stone-200/80 shadow-soft'
                }
              `}
              aria-pressed={isActive}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-200' : 'text-stone-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
