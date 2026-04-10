import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useTheme } from '../../features/theme/ThemeProvider';
import { GradientButton } from '../../components/GradientButton';
import { AppSwitchRow } from '../../components/AppSwitchRow';
import { AppCard } from '../../components/AppCard';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList, 'TaxConfig'>;

export function TaxConfigScreen() {
  const navigation = useNavigation<NavProp>();
  const { theme } = useTheme();
  const pasEnabled = useOnboardingStore((s) => s.pasEnabled);
  const pasRate = useOnboardingStore((s) => s.pasRate);
  const setPasEnabled = useOnboardingStore((s) => s.setPasEnabled);
  const setPasRate = useOnboardingStore((s) => s.setPasRate);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.step, { color: theme.textSecondary }]}>Étape 3/4</Text>
          <TouchableOpacity onPress={completeOnboarding}>
            <Text style={[styles.skipBtn, { color: theme.textMuted }]}>Passer</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Configuration fiscale</Text>
      </View>

      <AppCard>
        <AppSwitchRow
          label="Prélèvement à la source (PAS)"
          description="Activer pour déduire l'impôt sur le revenu"
          value={pasEnabled}
          onValueChange={setPasEnabled}
        />

        {pasEnabled && (
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={[styles.sliderLabel, { color: theme.text }]}>Taux PAS</Text>
              <Text style={[styles.sliderValue, { color: theme.primary }]}>
                {pasRate.toFixed(1)}%
              </Text>
            </View>
            <Slider
              minimumValue={0}
              maximumValue={50}
              step={0.5}
              value={pasRate}
              onValueChange={setPasRate}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.surfaceLight}
              thumbTintColor={theme.primary}
              style={styles.slider}
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderBound, { color: theme.textMuted }]}>0%</Text>
              <Text style={[styles.sliderBound, { color: theme.textMuted }]}>50%</Text>
            </View>
          </View>
        )}
      </AppCard>

      <View style={styles.footer}>
        <GradientButton title="Continuer" onPress={() => navigation.navigate('Summary')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  step: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  skipBtn: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800' },
  sliderSection: { marginTop: 20 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sliderLabel: { fontSize: 15, fontWeight: '600' },
  sliderValue: { fontSize: 20, fontWeight: '800' },
  slider: { marginHorizontal: -8 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderBound: { fontSize: 12 },
  footer: { flex: 1, justifyContent: 'flex-end' },
});
