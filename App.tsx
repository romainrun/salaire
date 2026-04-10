import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/features/theme/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useSalaryRealtimeSync } from './src/hooks/useSalaryRealtimeSync';

function AppContent() {
  const { isDark } = useTheme();
  useSalaryRealtimeSync();

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
