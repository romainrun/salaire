import { useCallback, useMemo, useRef } from 'react';
import { adService } from './adService';
import { usePremiumStore } from '../../store/premiumStore';
import { useUIStore } from '../../store/uiStore';

const SESSION_AD_CAP = 3;
const DAILY_AD_CAP = 5;
const ACTIONS_BETWEEN_INTERSTITIAL = 2;
const MIN_SECONDS_BETWEEN_INTERSTITIALS = 10;

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

  const canAttempt = useCallback(() => {
    if (isAdFreeActive()) return false;
    if (isCapped) return false;
    if (isTyping) return false;
    if (lastAdTimestamp && Date.now() - lastAdTimestamp < MIN_SECONDS_BETWEEN_INTERSTITIALS * 1000) {
      return false;
    }
    return true;
  }, [isAdFreeActive, isCapped, isTyping, lastAdTimestamp]);

  const tryShowFirstValueInterstitial = useCallback(async () => {
    if (!canAttempt()) return 'skipped' as const;
    const result = await adService.tryShowInterstitial();
    if (result === 'shown') {
      registerInterstitialShown();
    }
    return result;
  }, [canAttempt, registerInterstitialShown]);

  const tryShowContextualInterstitial = useCallback(async () => {
    if (!canAttempt()) return 'skipped' as const;
    const result = await adService.tryShowInterstitial();
    if (result === 'shown') {
      registerInterstitialShown();
    }
    return result;
  }, [canAttempt, registerInterstitialShown]);

  const trackActionAndMaybeShowInterstitial = useCallback(async () => {
    incrementActionCount();
    if (!canAttempt()) return 'skipped' as const;
    const nextActionCount = actionCountRef.current + 1;
    if (nextActionCount % ACTIONS_BETWEEN_INTERSTITIAL !== 0) return 'skipped' as const;
    const result = await adService.tryShowInterstitial();
    if (result === 'shown') {
      registerInterstitialShown();
    }
    return result;
  }, [canAttempt, incrementActionCount, registerInterstitialShown]);

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
