import type { AdService, InterstitialShowResult, RewardedShowResult } from './types';
import { ADMOB_CONFIG } from '../../config/monetization';
import { ADS_ENABLED_IN_BUILD } from '../../config/runtimeFlags';

class WebAdService implements AdService {
  async initialize(): Promise<void> {}
  preloadInterstitial(): void {}
  preloadRewarded(): void {}
  isInterstitialReady(): boolean {
    return false;
  }
  isRewardedReady(): boolean {
    return false;
  }
  async tryShowInterstitial(): Promise<InterstitialShowResult> {
    if (!ADS_ENABLED_IN_BUILD) return 'skipped';
    return 'skipped';
  }
  async tryShowRewarded(_onReward: () => void): Promise<RewardedShowResult> {
    if (!ADS_ENABLED_IN_BUILD) return 'skipped';
    return 'skipped';
  }
  getBannerUnitId(): string | null {
    if (!ADS_ENABLED_IN_BUILD) return null;
    return ADMOB_CONFIG.banner;
  }
  isSupported(): boolean {
    return false;
  }
}

export const adService = new WebAdService();
