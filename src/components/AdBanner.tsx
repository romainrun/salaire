import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { adService, type AdSdk } from '../features/ads/adService';
import { usePremiumStore } from '../store/premiumStore';

interface AdBannerProps {
  topSpacing?: number;
}

export function AdBanner({ topSpacing = 0 }: AdBannerProps) {
  const isAdFreeActive = usePremiumStore((s) => s.isAdFreeActive);
  const unitId = adService.getBannerUnitId();
  const sdk = useMemo(() => {
    if (!adService.isSupported()) return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('react-native-google-mobile-ads') as AdSdk;
    } catch (error) {
      console.warn('[ads] banner sdk unavailable', error);
      return null;
    }
  }, []);

  if (isAdFreeActive() || !unitId || !sdk) {
    return null;
  }

  const BannerAd = sdk.BannerAd;
  const BannerAdSize = sdk.BannerAdSize;

  return (
    <View style={[styles.container, { marginTop: topSpacing }]}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
});
