import { useMemo } from 'react';
import { usePremiumStore, type UnlockableFeature } from '../../store/premiumStore';
import { useSalaryStore } from '../../store/salaryStore';
import { useUIStore } from '../../store/uiStore';

export type FeatureGateKey = 'history' | 'comparison' | 'advancedOptions' | 'multiCurrency';

export interface FeatureGateResult {
  allowed: boolean;
  requiresRewarded: boolean;
  requiresPremium: boolean;
  reason: string | null;
}

const FREE_HISTORY_LIMIT = 3;
const FREE_COMPARISON_LIMIT = 1;

function getFallbackFeatureForGate(key: FeatureGateKey): UnlockableFeature | null {
  if (key === 'history') return 'history';
  if (key === 'comparison') return 'comparison';
  if (key === 'advancedOptions') return 'advancedOptions';
  if (key === 'multiCurrency') return 'multiCurrency';
  return null;
}

function evaluateGate(key: FeatureGateKey): FeatureGateResult {
  const premium = usePremiumStore.getState();
  const salary = useSalaryStore.getState();
  const ui = useUIStore.getState();

  if (premium.isPremium) {
    return { allowed: true, requiresRewarded: false, requiresPremium: false, reason: null };
  }

  if (key === 'history') {
    const rewardedUnlocked = premium.isFeatureUnlocked('history');
    const underLimit = salary.history.length < FREE_HISTORY_LIMIT;
    if (underLimit || rewardedUnlocked) {
      return { allowed: true, requiresRewarded: false, requiresPremium: false, reason: null };
    }
    return {
      allowed: false,
      requiresRewarded: true,
      requiresPremium: true,
      reason: `Historique gratuit limité à ${FREE_HISTORY_LIMIT} entrées.`,
    };
  }

  if (key === 'comparison') {
    const rewardedUnlocked = premium.isFeatureUnlocked('comparison');
    const underLimit = ui.comparisonUsageCount < FREE_COMPARISON_LIMIT;
    if (underLimit || rewardedUnlocked) {
      return { allowed: true, requiresRewarded: false, requiresPremium: false, reason: null };
    }
    return {
      allowed: false,
      requiresRewarded: true,
      requiresPremium: true,
      reason: `Comparaison gratuite limitée à ${FREE_COMPARISON_LIMIT} session active.`,
    };
  }

  if (key === 'advancedOptions') {
    if (premium.isFeatureUnlocked('advancedOptions')) {
      return { allowed: true, requiresRewarded: false, requiresPremium: false, reason: null };
    }
    return {
      allowed: false,
      requiresRewarded: true,
      requiresPremium: true,
      reason: 'Les options avancées sont réservées au Premium ou à un déblocage pub.',
    };
  }

  if (key === 'multiCurrency') {
    if (premium.isFeatureUnlocked('multiCurrency')) {
      return { allowed: true, requiresRewarded: false, requiresPremium: false, reason: null };
    }
    return {
      allowed: false,
      requiresRewarded: true,
      requiresPremium: true,
      reason: 'L\'affichage multi-devise est réservé au Premium.',
    };
  }

  return { allowed: true, requiresRewarded: false, requiresPremium: false, reason: null };
}

export function getFeatureGate(key: FeatureGateKey): FeatureGateResult {
  return evaluateGate(key);
}

export function getFeatureRewardedTarget(key: FeatureGateKey): UnlockableFeature | null {
  return getFallbackFeatureForGate(key);
}

export function useFeatureGate(key: FeatureGateKey): FeatureGateResult {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const adFreeUntil = usePremiumStore((s) => s.adFreeUntil);
  const unlockedFeatures = usePremiumStore((s) => s.unlockedFeatures);
  const historyCount = useSalaryStore((s) => s.history.length);
  const comparisonUsageCount = useUIStore((s) => s.comparisonUsageCount);

  return useMemo(
    () => evaluateGate(key),
    [key, isPremium, adFreeUntil, unlockedFeatures, historyCount, comparisonUsageCount]
  );
}
