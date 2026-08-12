'use client';

import { useState } from 'react';
import { decomposeGoalWithAI } from '@/lib/goals/decomposeAI';
import { getGoalsAdapter } from '@/lib/adapters';

const goalsAdapter = getGoalsAdapter();

export function useGoalProposals(familyId?: string, childId?: string, onSubmitted?: () => void) {
  const [isProposingGoal, setIsProposingGoal] = useState(false);
  const [goalPropTitle, setGoalPropTitle] = useState('');
  const [goalPropWhy, setGoalPropWhy] = useState('');
  const [goalPropSteps, setGoalPropSteps] = useState<string[]>(['', '', '']);
  const [goalPropSubmitting, setGoalPropSubmitting] = useState(false);
  const [goalPropError, setGoalPropError] = useState('');
  const [isGeneratingAIDecompose, setIsGeneratingAIDecompose] = useState(false);

  const resetGoalProposalForm = () => {
    setGoalPropTitle('');
    setGoalPropWhy('');
    setGoalPropSteps(['', '', '']);
    setGoalPropError('');
    setGoalPropSubmitting(false);
    setIsGeneratingAIDecompose(false);
  };

  const setGoalPropStepValue = (index: number, value: string) => {
    setGoalPropSteps((prev) => {
      const next = [...prev];
      if (index >= next.length) {
        while (next.length <= index) next.push('');
      }
      next[index] = value;
      return next;
    });
  };

  const addGoalPropStep = () => {
    setGoalPropSteps((prev) => [...prev, '']);
  };

  const removeGoalPropStep = (index: number) => {
    setGoalPropSteps((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const setTargetStepCount = (count: number) => {
    const validCount = Math.max(1, Math.min(10, count));
    setGoalPropSteps((prev) => {
      if (prev.length === validCount) return prev;
      if (prev.length < validCount) {
        const next = [...prev];
        while (next.length < validCount) next.push('');
        return next;
      }
      return prev.slice(0, validCount);
    });
  };

  const handleAIDecomposeInModal = async () => {
    if (!goalPropTitle.trim()) return;
    setIsGeneratingAIDecompose(true);
    const targetCount = goalPropSteps.length > 0 ? goalPropSteps.length : 3;
    const result = await decomposeGoalWithAI(goalPropTitle, targetCount);
    setIsGeneratingAIDecompose(false);

    if (result.microtasks.length > 0) {
      setGoalPropSteps(result.microtasks.map((m) => m.title));
    }
  };

  const handleProposeGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalPropTitle.trim()) {
      setGoalPropError('Ingresa un título para tu aventura.');
      return;
    }
    if (!childId || !familyId) {
      setGoalPropError('Error de autenticación.');
      return;
    }

    setGoalPropSubmitting(true);
    setGoalPropError('');

    const rawSteps = goalPropSteps.map((s) => s.trim()).filter(Boolean);
    const stepsToUse =
      rawSteps.length > 0
        ? rawSteps
        : [
            'Paso 1: Empezar a explorar',
            'Paso 2: Practicar con paciencia',
            'Paso 3: Celebrar el logro',
          ];

    const result = await goalsAdapter.createGoal({
      family_id: familyId,
      child_id: childId,
      created_by: childId,
      title: goalPropTitle.trim(),
      why: goalPropWhy.trim() || undefined,
      co_created: true,
      one_per_day: true,
      status: 'paused',
      microtasks: stepsToUse.map((t, idx) => ({
        title: t,
        position: idx + 1,
        spark_value: (idx + 1) * 2,
        value_dimensions: ['autonomy'],
        effort_level: idx === 0 ? 'easy' : idx === stepsToUse.length - 1 ? 'stretch' : 'medium',
      })),
    });

    setGoalPropSubmitting(false);

    if (!result.ok) {
      setGoalPropError(result.error.message || 'No se pudo enviar la propuesta.');
      return;
    }

    resetGoalProposalForm();
    setIsProposingGoal(false);
    onSubmitted?.();
  };

  return {
    isProposingGoal,
    setIsProposingGoal: (open: boolean) => {
      if (open) resetGoalProposalForm();
      setIsProposingGoal(open);
    },
    goalPropTitle,
    setGoalPropTitle,
    goalPropWhy,
    setGoalPropWhy,
    goalPropSteps,
    setGoalPropSteps,
    setGoalPropStepValue,
    addGoalPropStep,
    removeGoalPropStep,
    setTargetStepCount,
    // Legacy getters/setters for backwards compatibility
    goalPropStep1: goalPropSteps[0] || '',
    setGoalPropStep1: (v: string) => setGoalPropStepValue(0, v),
    goalPropStep2: goalPropSteps[1] || '',
    setGoalPropStep2: (v: string) => setGoalPropStepValue(1, v),
    goalPropStep3: goalPropSteps[2] || '',
    setGoalPropStep3: (v: string) => setGoalPropStepValue(2, v),
    goalPropSubmitting,
    setGoalPropSubmitting,
    goalPropError,
    setGoalPropError,
    isGeneratingAIDecompose,
    handleAIDecomposeInModal,
    handleProposeGoalSubmit,
    resetGoalProposalForm,
  };
}
