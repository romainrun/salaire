import type { AdService, InterstitialShowResult, RewardedShowResult } from './types';
import { ADMOB_CONFIG } from '../../config/monetization';

const INTERSTITIAL_LOAD_RETRY_MS = 2000;
const REWARDED_LOAD_RETRY_MS = 2000;
const SHOW_TIMEOUT_MS = 3000;

type AdSdk = typeof import('react-native-google-mobile-ads');

export type { AdSdk };

class NoopAdService implements AdService {
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
    return null;
  }
  isSupported(): boolean {
    return false;
  }
}

class MobileAdService implements AdService {
  private initialized = false;
  private interstitialReady = false;
  private rewardedReady = false;
  private loadingInterstitial = false;
  private loadingRewarded = false;
  private interstitial: import('react-native-google-mobile-ads').InterstitialAd | null = null;
  private rewarded: import('react-native-google-mobile-ads').RewardedAd | null = null;
  private interstitialLoadUnsubscribe: (() => void) | null = null;
  private rewardedLoadUnsubscribe: (() => void) | null = null;
  private interstitialShowUnsubscribe: (() => void) | null = null;
  private rewardedShowUnsubscribe: (() => void) | null = null;
  private sdk: AdSdk;
  private interstitialUnitId: string | null;
  private rewardedUnitId: string | null;
  private bannerUnitId: string | null;

  constructor(sdk: AdSdk) {
    this.sdk = sdk;
    this.interstitialUnitId = __DEV__ ? sdk.TestIds.INTERSTITIAL : ADMOB_CONFIG.interstitial;
    this.rewardedUnitId = __DEV__ ? sdk.TestIds.REWARDED : ADMOB_CONFIG.rewarded;
    this.bannerUnitId = __DEV__ ? sdk.TestIds.BANNER : ADMOB_CONFIG.banner;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const consent = await this.sdk.AdsConsent.requestInfoUpdate();
      if (consent.status === this.sdk.AdsConsentStatus.REQUIRED) {
        await this.sdk.AdsConsent.loadAndShowConsentFormIfRequired();
      }
    } catch (error) {
      console.warn('[ads] consent failed', error);
    }
    try {
      await this.sdk.MobileAds().initialize();
      this.initialized = true;
      this.preloadInterstitial();
      this.preloadRewarded();
    } catch (error) {
      console.warn('[ads] sdk init failed', error);
    }
  }

  preloadInterstitial(): void {
    if (!this.interstitialUnitId || this.loadingInterstitial || this.interstitialReady) return;
    this.loadingInterstitial = true;
    this.interstitial = this.sdk.InterstitialAd.createForAdRequest(this.interstitialUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    this.interstitialLoadUnsubscribe?.();
    this.interstitialLoadUnsubscribe = this.interstitial.addAdEventsListener((event) => {
      if (event.type === this.sdk.AdEventType.LOADED) {
        this.interstitialReady = true;
        this.loadingInterstitial = false;
        return;
      }
      if (event.type === this.sdk.AdEventType.CLOSED) {
        this.interstitialReady = false;
        this.loadingInterstitial = false;
        this.preloadInterstitial();
        return;
      }
      if (event.type === this.sdk.AdEventType.ERROR) {
        this.interstitialReady = false;
        this.loadingInterstitial = false;
        console.warn('[ads] interstitial load/show error', event.payload);
        setTimeout(() => this.preloadInterstitial(), INTERSTITIAL_LOAD_RETRY_MS);
      }
    });
    try {
      this.interstitial.load();
    } catch (error) {
      this.loadingInterstitial = false;
      this.interstitialReady = false;
      console.warn('[ads] interstitial preload failed', error);
      setTimeout(() => this.preloadInterstitial(), INTERSTITIAL_LOAD_RETRY_MS);
    }
  }

  preloadRewarded(): void {
    if (!this.rewardedUnitId || this.loadingRewarded || this.rewardedReady) return;
    this.loadingRewarded = true;
    this.rewarded = this.sdk.RewardedAd.createForAdRequest(this.rewardedUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    this.rewardedLoadUnsubscribe?.();
    this.rewardedLoadUnsubscribe = this.rewarded.addAdEventsListener((event) => {
      if (event.type === this.sdk.RewardedAdEventType.LOADED) {
        this.rewardedReady = true;
        this.loadingRewarded = false;
        return;
      }
      if (event.type === this.sdk.AdEventType.CLOSED) {
        this.rewardedReady = false;
        this.loadingRewarded = false;
        this.preloadRewarded();
        return;
      }
      if (event.type === this.sdk.AdEventType.ERROR) {
        this.rewardedReady = false;
        this.loadingRewarded = false;
        console.warn('[ads] rewarded load/show error', event.payload);
        setTimeout(() => this.preloadRewarded(), REWARDED_LOAD_RETRY_MS);
      }
    });
    try {
      this.rewarded.load();
    } catch (error) {
      this.loadingRewarded = false;
      this.rewardedReady = false;
      console.warn('[ads] rewarded preload failed', error);
      setTimeout(() => this.preloadRewarded(), REWARDED_LOAD_RETRY_MS);
    }
  }

  isInterstitialReady(): boolean {
    return this.interstitialReady;
  }

  isRewardedReady(): boolean {
    return this.rewardedReady;
  }

  async tryShowInterstitial(): Promise<InterstitialShowResult> {
    if (!this.interstitialReady || !this.interstitial) {
      this.preloadInterstitial();
      return 'skipped';
    }
    return new Promise((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        this.interstitialShowUnsubscribe?.();
        console.warn('[ads] interstitial timeout');
        resolve('timeout');
      }, SHOW_TIMEOUT_MS);

      this.interstitialShowUnsubscribe?.();
      this.interstitialShowUnsubscribe = this.interstitial?.addAdEventsListener((event) => {
        if (resolved) return;
        if (event.type === this.sdk.AdEventType.OPENED) {
          resolved = true;
          clearTimeout(timeout);
          this.interstitialShowUnsubscribe?.();
          resolve('shown');
          return;
        }
        if (event.type === this.sdk.AdEventType.ERROR) {
          resolved = true;
          clearTimeout(timeout);
          this.interstitialShowUnsubscribe?.();
          console.warn('[ads] interstitial show error', event.payload);
          resolve('error');
        }
      }) ?? null;

      try {
        this.interstitial?.show();
      } catch (error) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          this.interstitialShowUnsubscribe?.();
          console.warn('[ads] interstitial show exception', error);
          resolve('error');
        }
      } finally {
        this.interstitialReady = false;
        this.preloadInterstitial();
      }
    });
  }

  async tryShowRewarded(onReward: () => void): Promise<RewardedShowResult> {
    if (!this.rewardedReady || !this.rewarded) {
      this.preloadRewarded();
      return 'skipped';
    }
    return new Promise((resolve) => {
      let resolved = false;
      let rewardGranted = false;
      const timeout = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        this.rewardedShowUnsubscribe?.();
        console.warn('[ads] rewarded timeout');
        resolve('timeout');
      }, SHOW_TIMEOUT_MS);

      this.rewardedShowUnsubscribe?.();
      this.rewardedShowUnsubscribe = this.rewarded?.addAdEventsListener((event) => {
        if (resolved) return;
        if (event.type === this.sdk.RewardedAdEventType.EARNED_REWARD) {
          rewardGranted = true;
          try {
            onReward();
          } catch (rewardError) {
            console.warn('[ads] rewarded callback failed', rewardError);
          }
          return;
        }
        if (event.type === this.sdk.AdEventType.CLOSED) {
          resolved = true;
          clearTimeout(timeout);
          this.rewardedShowUnsubscribe?.();
          resolve(rewardGranted ? 'rewarded' : 'closed');
          return;
        }
        if (event.type === this.sdk.AdEventType.ERROR) {
          resolved = true;
          clearTimeout(timeout);
          this.rewardedShowUnsubscribe?.();
          console.warn('[ads] rewarded show error', event.payload);
          resolve('error');
        }
      }) ?? null;

      try {
        this.rewarded?.show();
      } catch (error) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          this.rewardedShowUnsubscribe?.();
          console.warn('[ads] rewarded show exception', error);
          resolve('error');
        }
      } finally {
        this.rewardedReady = false;
        this.preloadRewarded();
      }
    });
  }

  getBannerUnitId(): string | null {
    return this.bannerUnitId;
  }

  isSupported(): boolean {
    return true;
  }
}

function createAdService(): AdService {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sdk = require('react-native-google-mobile-ads') as AdSdk;
    return new MobileAdService(sdk);
  } catch (error) {
    console.warn('[ads] sdk not available, using noop service', error);
    return new NoopAdService();
  }
}

export const adService = createAdService();
