import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../features/theme/ThemeProvider';
import { useSalaryStore } from '../../store/salaryStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { AppCard } from '../../components/AppCard';
import { AmountInput } from '../../components/AmountInput';
import { GradientButton } from '../../components/GradientButton';
import { getCountryByCode } from '../../data';
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

  const targetNet = parseInputAmount(targetInput);
  const targetGross = useMemo(() => netToGross(targetNet, taxRate), [targetNet, taxRate]);

  const diffMonthly = targetNet - results.netMonthly;
  const percentIncrease = results.netMonthly > 0 ? ((diffMonthly / results.netMonthly) * 100) : 0;
  const diffYearly = monthlyToYearly(diffMonthly);

  const handleShare = async () => {
    const text = [
      '🎯 Objectif Salaire',
      `Net mensuel visé : ${formatCurrency(targetNet, symbol)}`,
      `Brut mensuel requis : ${formatCurrency(targetGross, symbol)}`,
      `Différence : ${diffMonthly >= 0 ? '+' : ''}${formatCurrency(diffMonthly, symbol)}/mois`,
      `Impact annuel : ${diffYearly >= 0 ? '+' : ''}${formatCurrency(diffYearly, symbol)}`,
      `Augmentation : ${percentIncrease >= 0 ? '+' : ''}${percentIncrease.toFixed(1)}%`,
    ].join('\n');
    try { await Share.share({ message: text }); } catch (_) {}
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Salaire cible</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Définissez votre objectif de salaire net
        </Text>

        <View style={styles.spacer} />

        <AmountInput
          value={targetInput}
          onChangeText={setTargetInput}
          label="Net mensuel souhaité"
          symbol={symbol}
        />

        {targetNet > 0 && (
          <>
            <AppCard>
              <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>Brut mensuel requis</Text>
              <Text style={[styles.resultValue, { color: theme.primary }]}>
                {formatCurrency(targetGross, symbol)}
              </Text>
            </AppCard>

            <AppCard>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Différence/mois</Text>
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
              <View style={[styles.statRow, { marginTop: 16 }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Impact annuel</Text>
                  <Text style={[styles.statValue, { color: diffYearly >= 0 ? theme.success : theme.danger }]}>
                    {diffYearly >= 0 ? '+' : ''}{formatCurrency(diffYearly, symbol)}
                  </Text>
                </View>
              </View>
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
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  spacer: { height: 24 },
  resultLabel: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  resultValue: { fontSize: 32, fontWeight: '900' },
  statRow: { flexDirection: 'row', gap: 16 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
});
