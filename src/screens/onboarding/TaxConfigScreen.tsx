import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.step, { color: theme.textSecondary }]}>
          \u00c9tape 3/4
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>
          Configuration fiscale
        </Text>
      </View>

      <AppCard>
        <AppSwitchRow
          label="Pr\u00e9l\u00e8vement \u00e0 la source (PAS)"
          description="Activer pour d\u00e9duire l\u2019imp\u00f4t sur le revenu"
          value={pasEnabled}
          onValueChange={setPasEnabled}
        />

        {pasEnabled && (
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={[styles.sliderLabel, { color: theme.text }]}>
                Taux PAS
              </Text>
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
              <Text style={[styles.sliderBound, { color: theme.textMuted }]}>
                0%
              </Text>
              <Text style={[styles.sliderBound, { color: theme.textMuted }]}>
                50%
              </Text>
            </View>
          </View>
        )}
      </AppCard>

      <View style={styles.footer}>
        <GradientButton
          title="Continuer"
          onPress={() => navigation.navigate('Summary')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  step: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  sliderSection: {
    marginTop: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  sliderValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  slider: {
    marginHorizontal: -8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderBound: {
    fontSize: 12,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
