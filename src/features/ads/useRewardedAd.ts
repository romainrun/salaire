import { Alert } from 'react-native';
import { useCallback, useRef } from 'react';
import { adService } from './adService';
import { usePremiumStore } from '../../store/premiumStore';

const DEFAULT_REWARD_MINUTES = 30;
const TAP_DEBOUNCE_MS = 800;

export function useRewardedAd() {
  const setAdFreeForMinutes = usePremiumStore((s) => s.setAdFreeForMinutes);
  const unlockFeatureForMinutes = usePremiumStore((s) => s.unlockFeatureForMinutes);
  const lastTapRef = useRef(0);

  const shouldDebounce = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < TAP_DEBOUNCE_MS) {
      return true;
    }
    lastTapRef.current = now;
    return false;
  }, []);

  const showUnavailableAlert = useCallback((message: string) => {
    Alert.alert('Publicité indisponible', message);
  }, []);

  const showRewardedWithRetry = useCallback(
    async (onReward: () => void) => {
      if (!adService.isSupported()) {
        showUnavailableAlert('Les publicités récompensées ne sont pas disponibles sur cette plateforme.');
        return 'skipped' as const;
      }
      if (!adService.isRewardedReady()) {
        adService.preloadRewarded();
      }
      const firstTry = await adService.tryShowRewarded(onReward);
      if (firstTry === 'rewarded') {
        return firstTry;
      }
      if (firstTry === 'error' || firstTry === 'timeout') {
        adService.preloadRewarded();
        return adService.tryShowRewarded(onReward);
      }
      return firstTry;
    },
    [showUnavailableAlert]
  );

  const unlockFeature = useCallback(
    async (featureKey: string) => {
      if (shouldDebounce()) return 'skipped' as const;
      const result = await showRewardedWithRetry(() => {
        unlockFeatureForMinutes(featureKey, DEFAULT_REWARD_MINUTES);
      });
      if (result === 'skipped') {
        showUnavailableAlert(
          'Vérifie ta connexion internet puis réessaie dans un instant.'
        );
      }
      if (result === 'error' || result === 'timeout') {
        showUnavailableAlert(
          'Une erreur est survenue pendant la publicité. Réessaie.'
        );
      }
      return result;
    },
    [showRewardedWithRetry, shouldDebounce, showUnavailableAlert, unlockFeatureForMinutes]
  );

  const unlockAdFree = useCallback(async () => {
    if (shouldDebounce()) return 'skipped' as const;
    const result = await showRewardedWithRetry(() => {
      setAdFreeForMinutes(DEFAULT_REWARD_MINUTES);
    });
    if (result === 'skipped') {
      showUnavailableAlert(
        'Vérifie ta connexion internet puis réessaie dans un instant.'
      );
    }
    if (result === 'error' || result === 'timeout') {
      showUnavailableAlert(
        'Une erreur est survenue pendant la publicité. Réessaie.'
      );
    }
    return result;
  }, [setAdFreeForMinutes, shouldDebounce, showRewardedWithRetry, showUnavailableAlert]);

  return {
    unlockFeature,
    unlockAdFree,
    rewardDurationMinutes: DEFAULT_REWARD_MINUTES,
  };
}
