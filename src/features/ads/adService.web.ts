import type { AdService, InterstitialShowResult, RewardedShowResult } from './types';
import { ADMOB_CONFIG } from '../../config/monetization';

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
    return 'skipped';
  }
  async tryShowRewarded(_onReward: () => void): Promise<RewardedShowResult> {
    return 'skipped';
  }
  getBannerUnitId(): string | null {
    return ADMOB_CONFIG.banner;
  }
  isSupported(): boolean {
    return false;
  }
}

export const adService = new WebAdService();
