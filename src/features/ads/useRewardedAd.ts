import { Alert } from 'react-native';
import { useCallback } from 'react';
import { adService } from './adService';
import { usePremiumStore, type UnlockableFeature } from '../../store/premiumStore';

const DEFAULT_REWARD_MINUTES = 30;

export type RewardedTarget = UnlockableFeature | 'adFree';

export function useRewardedAd() {
  const setAdFreeForMinutes = usePremiumStore((s) => s.setAdFreeForMinutes);
  const unlockFeatureForMinutes = usePremiumStore((s) => s.unlockFeatureForMinutes);
  const isPremium = usePremiumStore((s) => s.isPremium);

  const rewardForTarget = useCallback(
    (target: RewardedTarget) => {
      if (target === 'adFree') {
        setAdFreeForMinutes(DEFAULT_REWARD_MINUTES);
        return;
      }
      unlockFeatureForMinutes(target, DEFAULT_REWARD_MINUTES);
    },
    [setAdFreeForMinutes, unlockFeatureForMinutes]
  );

  const watchAdAndUnlock = useCallback(
    async (target: RewardedTarget) => {
      if (isPremium) {
        return 'rewarded' as const;
      }
      const result = await adService.tryShowRewarded(() => rewardForTarget(target));
      if (result !== 'rewarded') {
        Alert.alert(
          'Pub indisponible',
          'La publicité récompensée est momentanément indisponible. Réessaie dans un instant.'
        );
      }
      return result;
    },
    [isPremium, rewardForTarget]
  );

  return {
    watchAdAndUnlock,
    rewardDurationMinutes: DEFAULT_REWARD_MINUTES,
  };
}
