'use client';

import { useState, useCallback, useRef } from 'react';

export function useSensoryAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {
        // Safe catch for browser autoplay restrictions
      });
    }
    return audioCtxRef.current;
  }, []);

  const initAudio = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }, [getAudioContext]);

  const playCalmTone = useCallback((phase: 'inhale' | 'hold' | 'exhale' | 'hold1' | 'hold2' = 'inhale') => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const isExhale = phase === 'exhale';
      const isHold = phase === 'hold' || phase === 'hold1' || phase === 'hold2';
      const duration = isExhale ? 5.5 : isHold ? 3.8 : 3.8;

      // Primary harmonic oscillator (432Hz calming base frequency)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';

      if (phase === 'inhale') {
        osc1.frequency.setValueAtTime(320, now);
        osc1.frequency.exponentialRampToValueAtTime(432, now + duration);
        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.exponentialRampToValueAtTime(0.22, now + 0.5);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
      } else if (isHold) {
        osc1.frequency.setValueAtTime(432, now);
        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.exponentialRampToValueAtTime(0.15, now + 0.3);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
      } else {
        // exhale
        osc1.frequency.setValueAtTime(432, now);
        osc1.frequency.exponentialRampToValueAtTime(288, now + duration);
        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.exponentialRampToValueAtTime(0.24, now + 0.6);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
      }

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + duration + 0.1);

      // Warm sub-harmonic frequency for depth and soothing presence
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      const subFreq = phase === 'inhale' ? 160 : isExhale ? 144 : 216;
      osc2.frequency.setValueAtTime(subFreq, now);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.exponentialRampToValueAtTime(0.1, now + 0.5);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now);
      osc2.stop(now + duration + 0.1);
    } catch {
      // AudioContext silent fallback
    }
  }, [isMuted, getAudioContext]);

  const playCompletionChime = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 major triad

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.65);
      });
    } catch {
      // AudioContext fallback
    }
  }, [isMuted, getAudioContext]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    initAudio();
  }, [initAudio]);

  return {
    isMuted,
    initAudio,
    toggleMute,
    playCalmTone,
    playCompletionChime,
  };
}
