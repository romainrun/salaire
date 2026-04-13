import { useCallback, useMemo, useRef } from 'react';
import { adService } from './adService';
import { usePremiumStore } from '../../store/premiumStore';
import { useUIStore } from '../../store/uiStore';
import { analyticsService } from '../analytics/analyticsService';

const SESSION_AD_CAP = 3;
const DAILY_AD_CAP = 5;
const ACTIONS_BETWEEN_INTERSTITIAL = 2;
const MIN_SECONDS_BETWEEN_INTERSTITIALS = 10;
type InterstitialPlacement = 'first_value' | 'contextual' | 'action_interval';

function isDailyCapReached(dailyAdDate: string, dailyAdCount: number): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (dailyAdDate !== today) return false;
  return dailyAdCount >= DAILY_AD_CAP;
}

export function useInterstitialAd() {
  const isAdFreeActive = usePremiumStore((s) => s.isAdFreeActive);
  const actionCount = useUIStore((s) => s.actionCount);
  const sessionAdCount = useUIStore((s) => s.sessionAdCount);
  const dailyAdCount = useUIStore((s) => s.dailyAdCount);
  const dailyAdDate = useUIStore((s) => s.dailyAdDate);
  const lastAdTimestamp = useUIStore((s) => s.lastAdTimestamp);
  const isTyping = useUIStore((s) => s.isUserTyping);
  const registerInterstitialShown = useUIStore((s) => s.registerInterstitialShown);
  const incrementActionCount = useUIStore((s) => s.incrementActionCount);
  const actionCountRef = useRef(actionCount);
  actionCountRef.current = actionCount;

  const isCapped = useMemo(() => {
    if (sessionAdCount >= SESSION_AD_CAP) return true;
    return isDailyCapReached(dailyAdDate, dailyAdCount);
  }, [dailyAdCount, dailyAdDate, sessionAdCount]);

  const getSkipReason = useCallback((): string | null => {
    if (isAdFreeActive()) return 'ad_free';
    if (isCapped) return 'cap_reached';
    if (isTyping) return 'typing';
    if (lastAdTimestamp && Date.now() - lastAdTimestamp < MIN_SECONDS_BETWEEN_INTERSTITIALS * 1000) {
      return 'cooldown';
    }
    return null;
  }, [isAdFreeActive, isCapped, isTyping, lastAdTimestamp]);

  const canAttempt = useCallback(() => {
    return getSkipReason() === null;
  }, [getSkipReason]);

  const trackInterstitialEvent = useCallback(
    (placement: InterstitialPlacement, trigger: string, result: string, reason?: string) => {
      analyticsService.trackEvent('interstitial_event', {
        placement,
        trigger,
        result,
        reason,
        action_count: actionCountRef.current,
        session_ads: sessionAdCount,
        daily_ads: dailyAdCount,
      });
    },
    [dailyAdCount, sessionAdCount]
  );

  const tryShowFirstValueInterstitial = useCallback(async (trigger = 'default') => {
    const skipReason = getSkipReason();
    if (skipReason) {
      trackInterstitialEvent('first_value', trigger, 'skipped', skipReason);
      return 'skipped' as const;
    }
    const result = await adService.tryShowInterstitial();
    if (result === 'shown') {
      registerInterstitialShown();
    }
    trackInterstitialEvent('first_value', trigger, result);
    return result;
  }, [getSkipReason, registerInterstitialShown, trackInterstitialEvent]);

  const tryShowContextualInterstitial = useCallback(async (trigger = 'default') => {
    const skipReason = getSkipReason();
    if (skipReason) {
      trackInterstitialEvent('contextual', trigger, 'skipped', skipReason);
      return 'skipped' as const;
    }
    const result = await adService.tryShowInterstitial();
    if (result === 'shown') {
      registerInterstitialShown();
    }
    trackInterstitialEvent('contextual', trigger, result);
    return result;
  }, [getSkipReason, registerInterstitialShown, trackInterstitialEvent]);

  const trackActionAndMaybeShowInterstitial = useCallback(async (trigger = 'default') => {
    incrementActionCount();
    const nextActionCount = actionCountRef.current + 1;
    actionCountRef.current = nextActionCount;
    const skipReason = getSkipReason();
    if (skipReason) {
      trackInterstitialEvent('action_interval', trigger, 'skipped', skipReason);
      return 'skipped' as const;
    }
    if (nextActionCount % ACTIONS_BETWEEN_INTERSTITIAL !== 0) {
      trackInterstitialEvent('action_interval', trigger, 'skipped', 'interval_not_reached');
      return 'skipped' as const;
    }
    const result = await adService.tryShowInterstitial();
    if (result === 'shown') {
      registerInterstitialShown();
    }
    trackInterstitialEvent('action_interval', trigger, result);
    return result;
  }, [getSkipReason, incrementActionCount, registerInterstitialShown, trackInterstitialEvent]);

  const trackAction = useCallback(() => {
    incrementActionCount();
  }, [incrementActionCount]);

  return {
    canAttempt,
    isCapped,
    trackAction,
    trackActionAndMaybeShowInterstitial,
    tryShowContextualInterstitial,
    tryShowFirstValueInterstitial,
  };
}
