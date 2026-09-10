import { describe, it, expect, beforeEach } from 'vitest';
import { StaticGoalsAdapter } from '../adapters/StaticGoalsAdapter';

describe('StaticGoalsAdapter (Phase 4)', () => {
  let adapter: StaticGoalsAdapter;

  beforeEach(() => {
    adapter = new StaticGoalsAdapter();
  });

  describe('getGoals', () => {
    it('returns goals for active child', async () => {
      const res = await adapter.getGoals('static-child-1');
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.length).toBeGreaterThan(0);
      }
    });
  });

  describe('createGoal & completeMicrotask', () => {
    it('creates a goal and completes microtasks', async () => {
      const createRes = await adapter.createGoal({
        family_id: 'static-family-1',
        child_id: 'static-child-1',
        title: 'Bake a cake',
        description: 'Chocolate cake',
        value_dimensions: ['autonomy', 'curiosity'],
        created_by: 'static-parent-1',
        microtasks: [
          { position: 1, title: 'Buy ingredients', effort_level: 'easy', spark_value: 1, value_dimensions: ['autonomy'] },
          { position: 2, title: 'Mix flour', effort_level: 'medium', spark_value: 2, value_dimensions: ['curiosity'] },
        ],
      });

      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;

      const goal = createRes.data;
      const microtaskId = goal.microtasks[0].id;

      const completeRes = await adapter.completeMicrotask(microtaskId, 'static-child-1');
      expect(completeRes.ok).toBe(true);
      if (completeRes.ok) {
        expect(completeRes.data.status).toBe('complete');
      }
    });
  });
});

import { buildDecompositionPrompt, parseDecompositionResponse, fallbackDecomposition } from '../MicrotaskEngine';

describe('MicrotaskEngine decomposition & parsing', () => {
  it('buildDecompositionPrompt outputs valid schema without raw pipes in example', () => {
    const prompt = buildDecompositionPrompt({ goalTitle: 'Aprender a nadar', numTasks: 5, sparkValue: 2 });
    expect(prompt).toContain('Aprender a nadar');
    expect(prompt).toContain('"effort_level": "easy"');
    expect(prompt).not.toContain('"effort_level": "easy" | "medium"');
  });

  it('parseDecompositionResponse correctly returns null for empty microtasks', () => {
    const res = parseDecompositionResponse('{"microtasks":[]}', 'test-model');
    expect(res).toBeNull();
  });

  it('parseDecompositionResponse correctly parses valid microtasks', () => {
    const json = JSON.stringify({
      microtasks: [
        { position: 1, title: 'Paso 1', effort_level: 'easy', spark_value: 2, value_dimensions: ['autonomy'] },
        { position: 2, title: 'Paso 2', effort_level: 'medium', spark_value: 2, value_dimensions: ['courage'] },
      ]
    });
    const res = parseDecompositionResponse(json, 'test-model');
    expect(res).not.toBeNull();
    expect(res?.microtasks.length).toBe(2);
    expect(res?.microtasks[0].title).toBe('Paso 1');
  });

  it('fallbackDecomposition generates requested number of steps', () => {
    const fallback = fallbackDecomposition('Limpiar mi cuarto', 3, 2);
    expect(fallback.length).toBe(3);
    expect(fallback[0].title).toBe('Día 1: Limpiar mi cuarto');
    expect(fallback[0].spark_value).toBe(2);
  });
});

