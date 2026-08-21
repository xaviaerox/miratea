// ============================================================
// MIRA — Adapter Factory & Dynamic Delegating Adapters
// NEXT_PUBLIC_DATA_SOURCE=static|supabase
// ============================================================
import { supabase } from './supabase';

import { StaticAuthAdapter }    from './auth/StaticAuthAdapter';
import { SupabaseAuthAdapter }  from './auth/SupabaseAuthAdapter';
import type { IAuthAdapter, AuthSession, SignUpParentParams, SignUpChildParams, SignInParams } from './auth/IAuthAdapter';

import { StaticFamilyAdapter }   from './family/adapters/StaticFamilyAdapter';
import { SupabaseFamilyAdapter } from './family/adapters/SupabaseFamilyAdapter';
import type { IFamilyAdapter }   from './family/adapters/IFamilyAdapter';

import { StaticCompanionAdapter }   from './companion/adapters/StaticCompanionAdapter';
import { SupabaseCompanionAdapter } from './companion/adapters/SupabaseCompanionAdapter';
import type { ICompanionAdapter }   from './companion/adapters/ICompanionAdapter';

import { StaticRoutineAdapter }   from './routines/adapters/StaticRoutineAdapter';
import { SupabaseRoutineAdapter } from './routines/adapters/SupabaseRoutineAdapter';
import type { IRoutineAdapter, CreateRoutineParams, CompleteRoutineParams }   from './routines/adapters/IRoutineAdapter';

import { StaticGoalsAdapter }   from './goals/adapters/StaticGoalsAdapter';
import { SupabaseGoalsAdapter } from './goals/adapters/SupabaseGoalsAdapter';
import type { IGoalsAdapter, CreateGoalParams }   from './goals/adapters/IGoalsAdapter';

import { StaticEmotionalAdapter }   from './emotional/adapters/StaticEmotionalAdapter';
import { SupabaseEmotionalAdapter } from './emotional/adapters/SupabaseEmotionalAdapter';
import type { IEmotionalAdapter, SubmitCheckinParams }   from './emotional/adapters/IEmotionalAdapter';

import { StaticRewardsAdapter }   from './rewards/adapters/StaticRewardsAdapter';
import { SupabaseRewardsAdapter } from './rewards/adapters/SupabaseRewardsAdapter';
import type { IRewardsAdapter }   from './rewards/adapters/IRewardsAdapter';

import { StaticProgressionAdapter }   from './progression/adapters/StaticProgressionAdapter';
import { SupabaseProgressionAdapter } from './progression/adapters/SupabaseProgressionAdapter';
import type { IProgressionAdapter }   from './progression/adapters/IProgressionAdapter';

import { StaticSparkAdapter }   from './sparks/adapters/StaticSparkAdapter';
import { SupabaseSparkAdapter } from './sparks/adapters/SupabaseSparkAdapter';
import type { ISparkAdapter }   from './sparks/adapters/ISparkAdapter';

import type {
  Profile,
  Family,
  FamilyWithMembers,
  FamilyInvite,
  Companion,
  CompanionInteraction,
  CompanionInteractionType,
  CompanionMemory,
  Routine,
  RoutineStep,
  RoutineCompletion,
  RoutineWithSteps,
  Goal,
  GoalMicrotask,
  GoalWithMicrotasks,
  EmotionalCheckin,
  EmotionalWeeklySummary,
  Reward,
  RewardRequest,
  ChildValueScore,
  ValueScoreEvent,
  ChildBadge,
  SparkLedgerEntry,
  Result,
} from '@/types';
import type { CheckinPrompt } from '@/lib/emotional/EmotionModel';
import type { ParsedMicrotask } from '@/lib/goals/MicrotaskEngine';

export function isUseSupabase(): boolean {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('mira_demo_mode') === 'true') {
      return false;
    }
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('placeholder') || key === 'placeholder') {
    return false;
  }
  return (process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'static') === 'supabase';
}

export function isSupabase(): boolean {
  return isUseSupabase();
}

export const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'static';

// ─────────────────────────────────────────────────────────────
// Dynamic Delegating Adapters
// ─────────────────────────────────────────────────────────────

class DelegatingAuthAdapter implements IAuthAdapter {
  private staticAdapter = new StaticAuthAdapter();
  private supabaseAdapter = new SupabaseAuthAdapter(supabase);

  private get active(): IAuthAdapter {
    return isUseSupabase() ? this.supabaseAdapter : this.staticAdapter;
  }

  getSession(): Promise<AuthSession | null> {
    return this.active.getSession();
  }

  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
    const unsubStatic = this.staticAdapter.onAuthStateChange(s => {
      if (!isUseSupabase()) callback(s);
    });
    const unsubSupabase = this.supabaseAdapter.onAuthStateChange(s => {
      if (isUseSupabase()) callback(s);
    });
    return () => {
      unsubStatic();
      unsubSupabase();
    };
  }

  signUpParent(params: SignUpParentParams): Promise<Result<AuthSession>> {
    return this.active.signUpParent(params);
  }

  signUpWithInvite(params: SignUpChildParams): Promise<Result<AuthSession>> {
    return this.active.signUpWithInvite(params);
  }

  async signIn(params: SignInParams): Promise<Result<AuthSession>> {
    const isDemoAccount =
      params.email === 'child@demo.app' ||
      params.email === 'parent@mira.app' ||
      params.email.includes('demo') ||
      params.password === 'demo';

    if (isDemoAccount) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mira_demo_mode', 'true');
        localStorage.setItem(
          'mira_static_role',
          params.email.includes('parent') ? 'parent' : 'child'
        );
      }
      return this.staticAdapter.signIn(params);
    }

    return this.active.signIn(params);
  }

  signOut(): Promise<Result<void>> {
    return this.active.signOut();
  }

  updateProfile(updates: Partial<Pick<Profile, 'display_name' | 'avatar_seed' | 'onboarding_complete' | 'unlocked_accessories' | 'avatar_accessory' | 'avatar_base_emoji'>>): Promise<Result<Profile>> {
    return this.active.updateProfile(updates);
  }
}

class DelegatingFamilyAdapter implements IFamilyAdapter {
  private staticAdapter = new StaticFamilyAdapter();
  private supabaseAdapter = new SupabaseFamilyAdapter(supabase);

  private get active(): IFamilyAdapter {
    return isUseSupabase() ? this.supabaseAdapter : this.staticAdapter;
  }

  getFamily(familyId: string): Promise<Result<FamilyWithMembers>> { return this.active.getFamily(familyId); }
  getProfile(profileId: string): Promise<Result<Profile>> { return this.active.getProfile(profileId); }
  getChildren(familyId: string): Promise<Result<Profile[]>> { return this.active.getChildren(familyId); }
  updateFamilySettings(familyId: string, settings: Partial<Family['settings']>): Promise<Result<Family>> { return this.active.updateFamilySettings(familyId, settings); }
  createInvite(familyId: string, invitedBy: string, role: 'parent' | 'child'): Promise<Result<FamilyInvite>> { return this.active.createInvite(familyId, invitedBy, role); }
  getActiveInvites(familyId: string): Promise<Result<FamilyInvite[]>> { return this.active.getActiveInvites(familyId); }
  subscribeToFamily(familyId: string, callback: (members: Profile[]) => void): () => void { return this.active.subscribeToFamily(familyId, callback); }
}

class DelegatingCompanionAdapter implements ICompanionAdapter {
  private staticAdapter = new StaticCompanionAdapter();
  private supabaseAdapter = new SupabaseCompanionAdapter(supabase);

  private get active(): ICompanionAdapter {
    return isUseSupabase() ? this.supabaseAdapter : this.staticAdapter;
  }

  getCompanion(childId: string): Promise<Result<Companion | null>> { return this.active.getCompanion(childId); }
  createCompanion(childId: string, name: string): Promise<Result<Companion>> { return this.active.createCompanion(childId, name); }
  nameCompanion(companionId: string, name: string): Promise<Result<Companion>> { return this.active.nameCompanion(companionId, name); }
  recordInteraction(companionId: string, childId: string, type: CompanionInteractionType, context?: Record<string, unknown>): Promise<Result<CompanionInteraction>> { return this.active.recordInteraction(companionId, childId, type, context); }
  getInteractionCounts(companionId: string): Promise<Result<Record<CompanionInteractionType, number>>> { return this.active.getInteractionCounts(companionId); }
  updateCompanion(companionId: string, updates: Partial<Companion>): Promise<Result<Companion>> { return this.active.updateCompanion(companionId, updates); }
  subscribeToCompanion(childId: string, callback: (companion: Companion) => void): () => void { return this.active.subscribeToCompanion(childId, callback); }
  getMemories(childId: string): Promise<Result<CompanionMemory[]>> { return this.active.getMemories(childId); }
  createMemory(childId: string, companionId: string, type: 'routine_constancy_milestone' | 'difficult_checkin' | 'adventure_complete' | 'parent_badge_award', metadata: Record<string, unknown>): Promise<Result<CompanionMemory>> { return this.active.createMemory(childId, companionId, type, metadata); }
}

class DelegatingRoutineAdapter implements IRoutineAdapter {
  private staticAdapter = new StaticRoutineAdapter();
  private supabaseAdapter = new SupabaseRoutineAdapter(supabase);

  private get active(): IRoutineAdapter {
    return isUseSupabase() ? this.supabaseAdapter : this.staticAdapter;
  }

  getRoutines(familyId: string, childId?: string): Promise<Result<RoutineWithSteps[]>> { return this.active.getRoutines(familyId, childId); }
  getRoutine(routineId: string): Promise<Result<RoutineWithSteps>> { return this.active.getRoutine(routineId); }
  createRoutine(params: CreateRoutineParams): Promise<Result<RoutineWithSteps>> { return this.active.createRoutine(params); }
  updateRoutine(routineId: string, updates: Partial<Omit<Routine, 'id' | 'family_id' | 'created_at'>>, steps?: Omit<RoutineStep, 'id' | 'routine_id'>[]): Promise<Result<RoutineWithSteps>> { return this.active.updateRoutine(routineId, updates, steps); }
  archiveRoutine(routineId: string): Promise<Result<void>> { return this.active.archiveRoutine(routineId); }
  completeRoutine(params: CompleteRoutineParams): Promise<Result<RoutineCompletion>> { return this.active.completeRoutine(params); }
  getCompletions(childId: string, from: string, to: string): Promise<Result<RoutineCompletion[]>> { return this.active.getCompletions(childId, from, to); }
  isCompleteToday(routineId: string, childId: string): Promise<Result<boolean>> { return this.active.isCompleteToday(routineId, childId); }
  uncompleteRoutine(routineId: string, childId: string, completedDate?: string): Promise<Result<void>> { return this.active.uncompleteRoutine(routineId, childId, completedDate); }
}

class DelegatingGoalsAdapter implements IGoalsAdapter {
  private staticAdapter = new StaticGoalsAdapter();
  private supabaseAdapter = new SupabaseGoalsAdapter(supabase);

  private get active(): IGoalsAdapter {
    return isUseSupabase() ? this.supabaseAdapter : this.staticAdapter;
  }

  getGoals(childId: string): Promise<Result<GoalWithMicrotasks[]>> { return this.active.getGoals(childId); }
  getGoal(goalId: string): Promise<Result<GoalWithMicrotasks>> { return this.active.getGoal(goalId); }
  createGoal(params: CreateGoalParams): Promise<Result<GoalWithMicrotasks>> { return this.active.createGoal(params); }
  updateGoal(goalId: string, updates: Partial<Pick<Goal, 'title' | 'description' | 'why' | 'status' | 'target_date' | 'visibility' | 'co_created' | 'child_id' | 'one_per_day'>>, microtasks?: Omit<GoalMicrotask, 'id' | 'goal_id'>[]): Promise<Result<GoalWithMicrotasks>> { return this.active.updateGoal(goalId, updates, microtasks); }
  completeMicrotask(microtaskId: string, completedBy: string): Promise<Result<GoalMicrotask>> { return this.active.completeMicrotask(microtaskId, completedBy); }
  uncompleteMicrotask(microtaskId: string): Promise<Result<GoalMicrotask>> { return this.active.uncompleteMicrotask(microtaskId); }
  addMicrotasks(goalId: string, microtasks: ParsedMicrotask[]): Promise<Result<GoalMicrotask[]>> { return this.active.addMicrotasks(goalId, microtasks); }
}

class DelegatingEmotionalAdapter implements IEmotionalAdapter {
  private staticAdapter = new StaticEmotionalAdapter();
  private supabaseAdapter = new SupabaseEmotionalAdapter(supabase);

  private get active(): IEmotionalAdapter {
    return isUseSupabase() ? this.supabaseAdapter : this.staticAdapter;
  }

  submitCheckin(params: SubmitCheckinParams): Promise<Result<EmotionalCheckin>> { return this.active.submitCheckin(params); }
  getRecentCheckins(childId: string, limit?: number): Promise<Result<EmotionalCheckin[]>> { return this.active.getRecentCheckins(childId, limit); }
  getLastCheckin(childId: string): Promise<Result<EmotionalCheckin | null>> { return this.active.getLastCheckin(childId); }
  getWeeklySummaries(childId: string, weeksBack?: number): Promise<Result<EmotionalWeeklySummary[]>> { return this.active.getWeeklySummaries(childId, weeksBack); }
  getCheckinSchedule(childId: string): Promise<Result<CheckinPrompt[]>> { return this.active.getCheckinSchedule(childId); }
  updateCheckinSchedule(childId: string, schedule: CheckinPrompt[]): Promise<Result<CheckinPrompt[]>> { return this.active.updateCheckinSchedule(childId, schedule); }
}

class DelegatingRewardsAdapter implements IRewardsAdapter {
  private staticAdapter = new StaticRewardsAdapter();
  private supabaseAdapter = new SupabaseRewardsAdapter(supabase);

  private get active(): IRewardsAdapter {
    return isUseSupabase() ? this.supabaseAdapter : this.staticAdapter;
  }

  getRewards(familyId: string): Promise<Result<Reward[]>> { return this.active.getRewards(familyId); }
  createReward(familyId: string, reward: Omit<Reward, 'id' | 'family_id' | 'created_at' | 'updated_at'>): Promise<Result<Reward>> { return this.active.createReward(familyId, reward); }
  updateReward(rewardId: string, updates: Partial<Omit<Reward, 'id' | 'family_id' | 'created_at' | 'updated_at'>>): Promise<Result<Reward>> { return this.active.updateReward(rewardId, updates); }
  deleteReward(rewardId: string): Promise<Result<void>> { return this.active.deleteReward(rewardId); }
  getRewardRequests(familyId: string): Promise<Result<RewardRequest[]>> { return this.active.getRewardRequests(familyId); }
  createRewardRequest(familyId: string, childId: string, request: { title: string; emoji: string; cost?: number }): Promise<Result<RewardRequest>> { return this.active.createRewardRequest(familyId, childId, request); }
  updateRewardRequestStatus(requestId: string, status: 'approved' | 'rejected'): Promise<Result<RewardRequest>> { return this.active.updateRewardRequestStatus(requestId, status); }
  deleteRewardRequest(requestId: string): Promise<Result<void>> { return this.active.deleteRewardRequest(requestId); }
}

class DelegatingProgressionAdapter implements IProgressionAdapter {
  private staticAdapter = new StaticProgressionAdapter();
  private supabaseAdapter = new SupabaseProgressionAdapter(supabase);

  private get active(): IProgressionAdapter {
    return isUseSupabase() ? this.supabaseAdapter : this.staticAdapter;
  }

  getScores(childId: string): Promise<Result<ChildValueScore[]>> { return this.active.getScores(childId); }
  getEvents(childId: string, limit?: number): Promise<Result<ValueScoreEvent[]>> { return this.active.getEvents(childId, limit); }
  getBadges(childId: string): Promise<Result<ChildBadge[]>> { return this.active.getBadges(childId); }
  awardBadge(childId: string, familyId: string, dimensionId: string, tier: 'bronze' | 'silver' | 'gold', note?: string, parentId?: string): Promise<Result<ChildBadge>> { return this.active.awardBadge(childId, familyId, dimensionId, tier, note, parentId); }
}

class DelegatingSparkAdapter implements ISparkAdapter {
  private staticAdapter = new StaticSparkAdapter();
  private supabaseAdapter = new SupabaseSparkAdapter(supabase);

  private get active(): ISparkAdapter {
    return isUseSupabase() ? this.supabaseAdapter : this.staticAdapter;
  }

  getBalance(childId: string): Promise<Result<number>> { return this.active.getBalance(childId); }
  getHistory(childId: string, limit?: number): Promise<Result<SparkLedgerEntry[]>> { return this.active.getHistory(childId, limit); }
  awardBonus(childId: string, familyId: string, delta: number, note: string, parentId: string): Promise<Result<SparkLedgerEntry>> { return this.active.awardBonus(childId, familyId, delta, note, parentId); }
}

const authAdapterInstance        = new DelegatingAuthAdapter();
const familyAdapterInstance      = new DelegatingFamilyAdapter();
const companionAdapterInstance   = new DelegatingCompanionAdapter();
const routineAdapterInstance     = new DelegatingRoutineAdapter();
const goalsAdapterInstance       = new DelegatingGoalsAdapter();
const emotionalAdapterInstance   = new DelegatingEmotionalAdapter();
const rewardsAdapterInstance     = new DelegatingRewardsAdapter();
const progressionAdapterInstance = new DelegatingProgressionAdapter();
const sparkAdapterInstance       = new DelegatingSparkAdapter();

export function getAuthAdapter(): IAuthAdapter { return authAdapterInstance; }
export function getFamilyAdapter(): IFamilyAdapter { return familyAdapterInstance; }
export function getCompanionAdapter(): ICompanionAdapter { return companionAdapterInstance; }
export function getRoutineAdapter(): IRoutineAdapter { return routineAdapterInstance; }
export function getGoalsAdapter(): IGoalsAdapter { return goalsAdapterInstance; }
export function getEmotionalAdapter(): IEmotionalAdapter { return emotionalAdapterInstance; }
export function getRewardsAdapter(): IRewardsAdapter { return rewardsAdapterInstance; }
export function getProgressionAdapter(): IProgressionAdapter { return progressionAdapterInstance; }
export function getSparkAdapter(): ISparkAdapter { return sparkAdapterInstance; }
