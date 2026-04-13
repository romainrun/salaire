import { Alert } from 'react-native';
import { useCallback, useRef } from 'react';
import { adService } from './adService';
import { usePremiumStore } from '../../store/premiumStore';
import { analyticsService } from '../analytics/analyticsService';
import { ADS_DISABLED_OVERRIDE } from '../../config/runtimeFlags';

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
    async (onReward: () => void, context: string) => {
      if (ADS_DISABLED_OVERRIDE) {
        onReward();
        analyticsService.trackEvent('rewarded_result', {
          context,
          result: 'rewarded',
          reason: 'ads_disabled_override',
        });
        return 'rewarded' as const;
      }
      analyticsService.trackEvent('rewarded_attempt', {
        context,
        supported: adService.isSupported(),
        ready: adService.isRewardedReady(),
      });
      if (!adService.isSupported()) {
        showUnavailableAlert('Les publicités récompensées ne sont pas disponibles sur cette plateforme.');
        analyticsService.trackEvent('rewarded_result', { context, result: 'skipped', reason: 'unsupported' });
        return 'skipped' as const;
      }
      if (!adService.isRewardedReady()) {
        adService.preloadRewarded();
      }
      const firstTry = await adService.tryShowRewarded(onReward);
      if (firstTry === 'rewarded') {
        analyticsService.trackEvent('rewarded_result', { context, result: firstTry });
        return firstTry;
      }
      if (firstTry === 'error' || firstTry === 'timeout') {
        adService.preloadRewarded();
        const retryResult = await adService.tryShowRewarded(onReward);
        analyticsService.trackEvent('rewarded_result', { context, result: retryResult, retry: 1 });
        return retryResult;
      }
      analyticsService.trackEvent('rewarded_result', { context, result: firstTry });
      return firstTry;
    },
    [showUnavailableAlert]
  );

  const unlockFeature = useCallback(
    async (featureKey: string) => {
      if (shouldDebounce()) return 'skipped' as const;
      const result = await showRewardedWithRetry(() => {
        unlockFeatureForMinutes(featureKey, DEFAULT_REWARD_MINUTES);
      }, `unlock_feature_${featureKey}`);
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
    }, 'unlock_ad_free');
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
