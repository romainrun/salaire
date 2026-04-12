export type InterstitialShowResult = 'shown' | 'skipped' | 'error' | 'timeout';

export type RewardedShowResult = 'rewarded' | 'closed' | 'skipped' | 'error' | 'timeout';

export interface AdService {
  initialize: () => Promise<void>;
  preloadInterstitial: () => void;
  preloadRewarded: () => void;
  isInterstitialReady: () => boolean;
  isRewardedReady: () => boolean;
  tryShowInterstitial: () => Promise<InterstitialShowResult>;
  tryShowRewarded: (onReward: () => void) => Promise<RewardedShowResult>;
  getBannerUnitId: () => string | null;
  isSupported: () => boolean;
}
