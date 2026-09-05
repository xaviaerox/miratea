'use client';

import React from 'react';

interface GuideStepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  actor?: 'parent' | 'child' | 'both';
  details?: string[];
  tip?: string;
}

export function GuideStepCard({
  stepNumber,
  title,
  description,
  actor = 'parent',
  details,
  tip,
}: GuideStepCardProps) {
  const actorConfig = {
    parent: {
      label: 'Acción del Adulto / Tutor',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
      dotColor: 'bg-sky-500',
    },
    child: {
      label: 'Acción del Menor',
      badgeClass: 'bg-moss-100 text-moss-800 border-moss-200',
      dotColor: 'bg-moss-500',
    },
    both: {
      label: 'En Familia',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      dotColor: 'bg-amber-500',
    },
  }[actor];

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-soft transition-all hover:shadow-md space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-teal-700 text-white font-bold text-sm flex items-center justify-center shadow-sm">
            {stepNumber}
          </span>
          <h4 className="text-base font-bold text-stone-800">{title}</h4>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 shrink-0 ${actorConfig.badgeClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${actorConfig.dotColor}`} />
          {actorConfig.label}
        </span>
      </div>

      <p className="text-sm text-stone-600 leading-relaxed pl-11">
        {description}
      </p>

      {details && details.length > 0 && (
        <ul className="pl-11 space-y-1.5 text-xs text-stone-600 list-disc list-inside">
          {details.map((detail, idx) => (
            <li key={idx} className="leading-normal">
              {detail}
            </li>
          ))}
        </ul>
      )}

      {tip && (
        <div className="ml-11 mt-2 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <span className="text-amber-600 font-bold shrink-0">✦ Consejo:</span>
          <span>{tip}</span>
        </div>
      )}
    </div>
  );
}
