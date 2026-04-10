import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../features/theme/ThemeProvider';
import { useSalaryStore } from '../../store/salaryStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { AppCard } from '../../components/AppCard';
import { AmountInput } from '../../components/AmountInput';
import { SalaryChart } from '../../components/SalaryChart';
import { GradientButton } from '../../components/GradientButton';
import { EmptyState } from '../../components/EmptyState';
import { getCountryByCode } from '../../data';
import { LABELS } from '../../constants/appName';
import { parseInputAmount, formatCurrency } from '../../utils/format';
import { netToGross, monthlyToYearly } from '../../utils/salary';

export function TargetSalaryScreen() {
  const { theme } = useTheme();
  const results = useSalaryStore((s) => s.results);
  const country = useOnboardingStore((s) => s.country);
  const countryData = getCountryByCode(country);
  const symbol = countryData?.currencySymbol ?? '€';
  const taxRate = countryData?.taxRate ?? 0.23;

  const [targetInput, setTargetInput] = useState('');
  const [increasePercent, setIncreasePercent] = useState(0);

  const targetNet = parseInputAmount(targetInput);
  const sliderTarget = results.netMonthly > 0 && increasePercent > 0
    ? results.netMonthly * (1 + increasePercent / 100)
    : targetNet;
  const effectiveTarget = sliderTarget > 0 ? sliderTarget : targetNet;

  const targetGross = useMemo(() => netToGross(effectiveTarget, taxRate), [effectiveTarget, taxRate]);
  const diffMonthly = effectiveTarget - results.netMonthly;
  const percentIncrease = results.netMonthly > 0 ? ((diffMonthly / results.netMonthly) * 100) : 0;
  const diffYearly = monthlyToYearly(diffMonthly);

  const handleSliderChange = (val: number) => {
    setIncreasePercent(Math.round(val));
    if (results.netMonthly > 0) {
      setTargetInput(Math.round(results.netMonthly * (1 + val / 100)).toString());
    }
  };

  const handleShare = async () => {
    const text = [
      '🎯 Objectif Salaire',
      `Net mensuel visé : ${formatCurrency(effectiveTarget, symbol)}`,
      `Brut mensuel requis : ${formatCurrency(targetGross, symbol)}`,
      `Différence : ${diffMonthly >= 0 ? '+' : ''}${formatCurrency(diffMonthly, symbol)}/mois`,
      `Impact annuel : ${diffYearly >= 0 ? '+' : ''}${formatCurrency(diffYearly, symbol)}`,
      `Augmentation : ${percentIncrease >= 0 ? '+' : ''}${percentIncrease.toFixed(1)}%`,
      '',
      '🚀 Calculé avec l\'app Salaire',
    ].join('\n');
    try { await Share.share({ message: text }); } catch (_) {}
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>{LABELS.target}</Text>

        <AmountInput value={targetInput} onChangeText={(v) => { setTargetInput(v); setIncreasePercent(0); }} label="Net mensuel souhaité" symbol={symbol} />

        {effectiveTarget <= 0 && (
          <EmptyState icon="🎯" title={LABELS.emptyTarget} message={LABELS.emptyTargetMsg} />
        )}

        {results.netMonthly > 0 && (
          <AppCard>
            <View style={styles.sliderHeader}>
              <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>Simuler augmentation</Text>
              <Text style={[styles.sliderValue, { color: theme.primary }]}>+{increasePercent}%</Text>
            </View>
            <Slider
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={increasePercent}
              onValueChange={handleSliderChange}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.surfaceLight}
              thumbTintColor={theme.primary}
            />
          </AppCard>
        )}

        {effectiveTarget > 0 && (
          <>
            <AppCard>
              <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>Brut mensuel requis</Text>
              <Text style={[styles.resultValue, { color: theme.primary }]}>{formatCurrency(targetGross, symbol)}</Text>
            </AppCard>

            <AppCard>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Diff./mois</Text>
                  <Text style={[styles.statValue, { color: diffMonthly >= 0 ? theme.success : theme.danger }]}>
                    {diffMonthly >= 0 ? '+' : ''}{formatCurrency(diffMonthly, symbol)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Augmentation</Text>
                  <Text style={[styles.statValue, { color: percentIncrease >= 0 ? theme.success : theme.danger }]}>
                    {percentIncrease >= 0 ? '+' : ''}{percentIncrease.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <View style={[styles.statRow, { marginTop: 10 }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Impact annuel</Text>
                  <Text style={[styles.statValue, { color: diffYearly >= 0 ? theme.success : theme.danger }]}>
                    {diffYearly >= 0 ? '+' : ''}{formatCurrency(diffYearly, symbol)}
                  </Text>
                </View>
              </View>
            </AppCard>

            <AppCard>
              <SalaryChart gross={targetGross} net={effectiveTarget} symbol={symbol} />
            </AppCard>

            <GradientButton title="Partager" onPress={handleShare} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 30 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sliderLabel: { fontSize: 12, fontWeight: '500' },
  sliderValue: { fontSize: 16, fontWeight: '800' },
  resultLabel: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  resultValue: { fontSize: 26, fontWeight: '900' },
  statRow: { flexDirection: 'row', gap: 12 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: '800' },
});
