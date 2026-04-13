import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/features/theme/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useSalaryRealtimeSync } from './src/hooks/useSalaryRealtimeSync';
import { adService } from './src/features/ads/adService';
import { analyticsService } from './src/features/analytics/analyticsService';
import { useUIStore } from './src/store/uiStore';
import { usePremiumStore } from './src/store/premiumStore';

function AppContent() {
  const { isDark } = useTheme();
  const startSession = useUIStore((s) => s.startSession);
  const clearExpiredUnlocks = usePremiumStore((s) => s.clearExpiredUnlocks);
  useSalaryRealtimeSync();

  React.useEffect(() => {
    startSession();
    clearExpiredUnlocks();
    adService
      .initialize()
      .catch((error) => console.warn('[ads] init failed at app bootstrap', error));
    adService.preloadInterstitial();
    adService.preloadRewarded();
    analyticsService.trackEvent('app_open');
  }, [clearExpiredUnlocks, startSession]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <View style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
