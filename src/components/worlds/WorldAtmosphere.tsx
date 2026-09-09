'use client';

import React from 'react';
import { WORLD_THEMES } from '@/components/worlds/worldThemes';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface WorldAtmosphereProps {
  worldId: string;
  silentMode?: boolean;
}

interface ParticleConfig {
  icon: string;
  left: string;
  top: string;
  delay: string;
  duration: string;
  size: string;
  opacity: string;
}

const WORLD_PARTICLES: Record<string, ParticleConfig[]> = {
  lago_calma: [
    { icon: '🫧', left: '8%', top: '22%', delay: '0s', duration: '14s', size: 'text-xs', opacity: 'opacity-35' },
    { icon: '💧', left: '86%', top: '35%', delay: '4s', duration: '16s', size: 'text-[11px]', opacity: 'opacity-30' },
    { icon: '✨', left: '15%', top: '65%', delay: '2s', duration: '15s', size: 'text-[10px]', opacity: 'opacity-25' },
    { icon: '🫧', left: '80%', top: '78%', delay: '6s', duration: '18s', size: 'text-sm', opacity: 'opacity-35' },
  ],
  valle_habitos: [
    { icon: '🌸', left: '10%', top: '18%', delay: '0s', duration: '15s', size: 'text-xs', opacity: 'opacity-40' },
    { icon: '🍃', left: '88%', top: '28%', delay: '3s', duration: '17s', size: 'text-[11px]', opacity: 'opacity-35' },
    { icon: '🍀', left: '14%', top: '72%', delay: '6s', duration: '19s', size: 'text-[10px]', opacity: 'opacity-30' },
    { icon: '🌸', left: '82%', top: '68%', delay: '2s', duration: '16s', size: 'text-xs', opacity: 'opacity-40' },
  ],
  bosque_autonomia: [
    { icon: '🍃', left: '7%', top: '24%', delay: '1s', duration: '16s', size: 'text-xs', opacity: 'opacity-40' },
    { icon: '✨', left: '84%', top: '19%', delay: '4s', duration: '14s', size: 'text-[10px]', opacity: 'opacity-30' },
    { icon: '🌿', left: '12%', top: '60%', delay: '7s', duration: '18s', size: 'text-xs', opacity: 'opacity-35' },
    { icon: '✨', left: '89%', top: '75%', delay: '3s', duration: '15s', size: 'text-xs', opacity: 'opacity-35' },
  ],
  montana_esfuerzo: [
    { icon: '✦', left: '9%', top: '20%', delay: '0s', duration: '13s', size: 'text-xs', opacity: 'opacity-40' },
    { icon: '✧', left: '87%', top: '30%', delay: '3s', duration: '15s', size: 'text-[11px]', opacity: 'opacity-35' },
    { icon: '⭐', left: '16%', top: '70%', delay: '5s', duration: '17s', size: 'text-[10px]', opacity: 'opacity-30' },
    { icon: '✦', left: '83%', top: '65%', delay: '2s', duration: '14s', size: 'text-sm', opacity: 'opacity-40' },
  ],
  reino_social: [
    { icon: '♡', left: '8%', top: '22%', delay: '1s', duration: '14s', size: 'text-xs', opacity: 'opacity-40' },
    { icon: '✨', left: '86%', top: '25%', delay: '5s', duration: '16s', size: 'text-[11px]', opacity: 'opacity-35' },
    { icon: '💕', left: '12%', top: '68%', delay: '2s', duration: '18s', size: 'text-[10px]', opacity: 'opacity-30' },
    { icon: '♡', left: '84%', top: '74%', delay: '4s', duration: '15s', size: 'text-xs', opacity: 'opacity-40' },
  ],
};

export function WorldAtmosphere({ worldId, silentMode = false }: WorldAtmosphereProps) {
  const prefersReduced = useReducedMotion();
  const noAnim = silentMode || prefersReduced;

  const currentTheme = WORLD_THEMES.find((w) => w.id === worldId) || WORLD_THEMES[0]!;
  const particles = WORLD_PARTICLES[worldId] || WORLD_PARTICLES['valle_habitos']!;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0"
      aria-hidden="true"
    >
      {/* 1. Atmospheric Top Aura Gradient */}
      <div
        className={`absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b ${currentTheme.auraGradient} transition-all duration-1000 ease-out`}
      />

      {/* 2. Soft Ambient Radial Glow behind the central Terrarium */}
      <div
        className="absolute top-28 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full blur-3xl opacity-40 transition-all duration-1000 pointer-events-none"
        style={{
          background:
            worldId === 'lago_calma'
              ? 'radial-gradient(circle, rgba(186, 230, 253, 0.45) 0%, rgba(224, 242, 254, 0) 70%)'
              : worldId === 'valle_habitos'
              ? 'radial-gradient(circle, rgba(167, 243, 208, 0.45) 0%, rgba(209, 250, 229, 0) 70%)'
              : worldId === 'bosque_autonomia'
              ? 'radial-gradient(circle, rgba(167, 243, 208, 0.45) 0%, rgba(236, 253, 245, 0) 70%)'
              : worldId === 'montana_esfuerzo'
              ? 'radial-gradient(circle, rgba(254, 215, 170, 0.45) 0%, rgba(255, 237, 213, 0) 70%)'
              : 'radial-gradient(circle, rgba(233, 213, 255, 0.45) 0%, rgba(243, 232, 255, 0) 70%)',
        }}
      />

      {/* 3. Delicate Ambient Floating Details (Disabled in silent mode or reduced motion) */}
      {!noAnim && (
        <>
          <style
            dangerouslySetInnerHTML={{
              __html: `
              @keyframes ambientDrift {
                0% {
                  transform: translateY(0px) translateX(0px) rotate(0deg);
                }
                33% {
                  transform: translateY(-16px) translateX(6px) rotate(4deg);
                }
                66% {
                  transform: translateY(-8px) translateX(-6px) rotate(-3deg);
                }
                100% {
                  transform: translateY(0px) translateX(0px) rotate(0deg);
                }
              }
              .ambient-particle-drift {
                animation: ambientDrift ease-in-out infinite;
              }
            `,
            }}
          />
          {particles.map((p, idx) => (
            <span
              key={`${worldId}-particle-${idx}`}
              className={`absolute ${p.size} ${p.opacity} select-none ambient-particle-drift transition-opacity duration-700`}
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            >
              {p.icon}
            </span>
          ))}
        </>
      )}
    </div>
  );
}
