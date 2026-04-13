import { useMemo } from 'react';
import { usePremiumStore } from '../../store/premiumStore';
import { useSalaryStore } from '../../store/salaryStore';
import { useUIStore } from '../../store/uiStore';

export type FeatureGateKey = 'history' | 'comparison' | 'advancedOptions' | 'multiCurrency';

export interface FeatureGateResult {
  allowed: boolean;
  requiresAd: boolean;
}

const FREE_HISTORY_LIMIT = 3;
const FREE_COMPARISON_LIMIT = 1;

function evaluateGate(key: FeatureGateKey): FeatureGateResult {
  const premium = usePremiumStore.getState();
  const salary = useSalaryStore.getState();
  const ui = useUIStore.getState();

  if (key === 'history') {
    const adUnlocked = premium.isFeatureUnlocked('history');
    const underLimit = salary.history.length < FREE_HISTORY_LIMIT;
    if (underLimit || adUnlocked) {
      return { allowed: true, requiresAd: false };
    }
    return { allowed: false, requiresAd: true };
  }

  if (key === 'comparison') {
    const adUnlocked = premium.isFeatureUnlocked('comparison');
    const underLimit = ui.comparisonUsageCount < FREE_COMPARISON_LIMIT;
    if (underLimit || adUnlocked) {
      return { allowed: true, requiresAd: false };
    }
    return { allowed: false, requiresAd: true };
  }

  if (key === 'advancedOptions') {
    if (premium.isFeatureUnlocked('advancedOptions')) {
      return { allowed: true, requiresAd: false };
    }
    return { allowed: false, requiresAd: true };
  }

  if (key === 'multiCurrency') {
    if (premium.isFeatureUnlocked('multiCurrency')) {
      return { allowed: true, requiresAd: false };
    }
    return { allowed: false, requiresAd: true };
  }

  return { allowed: true, requiresAd: false };
}

export function getFeatureGate(key: FeatureGateKey): FeatureGateResult {
  return evaluateGate(key);
}

export function useFeatureGate(key: FeatureGateKey): FeatureGateResult {
  const adFreeUntil = usePremiumStore((s) => s.adFreeUntil);
  const unlockedFeatures = usePremiumStore((s) => s.unlockedFeatures);
  const historyCount = useSalaryStore((s) => s.history.length);
  const comparisonUsageCount = useUIStore((s) => s.comparisonUsageCount);

  return useMemo(
    () => evaluateGate(key),
    [key, adFreeUntil, unlockedFeatures, historyCount, comparisonUsageCount]
  );
}
