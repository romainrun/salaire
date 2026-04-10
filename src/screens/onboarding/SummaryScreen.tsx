import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useSalaryStore } from '../../store/salaryStore';
import { useTheme } from '../../features/theme/ThemeProvider';
import { GradientButton } from '../../components/GradientButton';
import { AppCard } from '../../components/AppCard';
import { getCountryByCode } from '../../data';

export function SummaryScreen() {
  const { theme } = useTheme();
  const onboarding = useOnboardingStore();
  const initializeFromSettings = useSalaryStore((s) => s.initializeFromSettings);
  const countryData = getCountryByCode(onboarding.country);

  const handleApply = () => {
    initializeFromSettings({
      taxRate: countryData?.taxRate ?? 0.23,
      pasEnabled: onboarding.pasEnabled,
      pasRate: onboarding.pasRate,
      workHoursPerWeek: onboarding.workHoursPerWeek,
      monthsPerYear: onboarding.monthsPerYear,
      countryCode: onboarding.country,
    });
    onboarding.completeOnboarding();
  };

  const summaryRows = [
    { label: 'Pays', value: `${countryData?.flag ?? ''} ${countryData?.name ?? onboarding.country}` },
    { label: 'Devise', value: countryData?.currencySymbol ?? onboarding.currency },
    { label: 'Mode', value: onboarding.useCase === 'convert' ? 'Convertir' : 'Objectif' },
    { label: 'PAS', value: onboarding.pasEnabled ? `Activé (${onboarding.pasRate}%)` : 'Désactivé' },
    { label: 'Charges', value: `${((countryData?.taxRate ?? 0.23) * 100).toFixed(0)}%` },
    { label: 'SMIC', value: countryData?.smic ? `${countryData.smic} ${countryData.currencySymbol}` : 'Non disponible' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.step, { color: theme.textSecondary }]}>Étape 4/4</Text>
        <Text style={[styles.title, { color: theme.text }]}>Récapitulatif</Text>
      </View>

      <AppCard>
        {summaryRows.map((row) => (
          <View key={row.label} style={[styles.row, { borderBottomColor: theme.border }]}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{row.label}</Text>
            <Text style={[styles.rowValue, { color: theme.text }]}>{row.value}</Text>
          </View>
        ))}
      </AppCard>

      <View style={styles.footer}>
        <GradientButton title="Appliquer et entrer" onPress={handleApply} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 32 },
  step: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 15, fontWeight: '700' },
  footer: { flex: 1, justifyContent: 'flex-end' },
});
