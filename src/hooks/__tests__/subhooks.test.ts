import { describe, it, expect } from 'vitest';
import { WORLD_THEMES } from '@/components/worlds/worldThemes';

describe('Sub-hooks Pure Functionality Tests', () => {
  it('should have world themes defined correctly', () => {
    expect(WORLD_THEMES).toBeDefined();
    expect(WORLD_THEMES.length).toBe(5);
    expect(WORLD_THEMES[0]?.id).toBe('lago_calma');

    WORLD_THEMES.forEach((theme) => {
      expect(theme.auraGradient).toBeDefined();
      expect(theme.auraGradient).not.toContain('dark:');
      expect(theme.bgGradient).not.toContain('dark:');
      expect(theme.ambientCues).toBeDefined();
      expect(theme.ambientCues.icon).toBeTruthy();
      expect(theme.textColor).toBeTruthy();
      expect(theme.accentBg).toBeTruthy();
    });
  });
});
