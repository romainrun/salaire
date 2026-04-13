import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { AppCard } from '../../components/AppCard';
import { AmountInput } from '../../components/AmountInput';
import { SalaryChart } from '../../components/SalaryChart';
import { EmptyState } from '../../components/EmptyState';
import { countries } from '../../data';
import { LABELS } from '../../constants/appName';
import { grossToNet } from '../../utils/salary';
import { formatCurrency, parseInputAmount } from '../../utils/format';
import type { Country } from '../../types';
import { useFeatureGate } from '../premium/useFeatureGate';
import { useRewardedAd } from '../ads/useRewardedAd';
import { usePremiumStore } from '../../store/premiumStore';
import { useUIStore } from '../../store/uiStore';
import { useInterstitialAd } from '../ads/useInterstitialAd';
import { AdUnlockModal } from '../unlock/AdUnlockModal';

function CountryPicker({
  selected,
  onSelect,
  theme,
}: {
  selected: string;
  onSelect: (c: Country) => void;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.countryRow}>
      {countries.map((c) => (
        <TouchableOpacity
          key={c.code}
          style={[
            styles.chip,
            {
              backgroundColor: c.code === selected ? theme.primary : theme.surfaceLight,
              borderColor: c.code === selected ? theme.primary : theme.border,
            },
          ]}
          onPress={() => onSelect(c)}
        >
          <Text style={styles.chipFlag}>{c.flag}</Text>
          <Text style={[styles.chipText, { color: c.code === selected ? '#FFF' : theme.text }]}>
            {c.code}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export function CompareScreen() {
  const { theme } = useTheme();
  const [salary, setSalary] = useState('');
  const [countryA, setCountryA] = useState(countries[0]);
  const [countryB, setCountryB] = useState(countries[4]);
  const [unlockVisible, setUnlockVisible] = useState(false);
  const [hasShownResultAd, setHasShownResultAd] = useState(false);

  const comparisonGate = useFeatureGate('comparison');
  const isComparisonUnlocked = usePremiumStore((s) => s.isFeatureUnlocked('comparison'));
  const incrementComparisonUsage = useUIStore((s) => s.incrementComparisonUsage);
  const resetComparisonUsage = useUIStore((s) => s.resetComparisonUsage);
  const { unlockFeature, unlockAdFree } = useRewardedAd();
  const { tryShowContextualInterstitial } = useInterstitialAd();

  const gross = parseInputAmount(salary);
  const netA = useMemo(() => grossToNet(gross, countryA.taxRate), [gross, countryA.taxRate]);
  const netB = useMemo(() => grossToNet(gross, countryB.taxRate), [gross, countryB.taxRate]);
  const diff = netA - netB;
  const isLimitedMode = !isComparisonUnlocked;

  useEffect(() => {
    if (!isLimitedMode) {
      resetComparisonUsage();
    }
  }, [isLimitedMode, resetComparisonUsage]);

  useEffect(() => {
    if (gross <= 0) {
      setHasShownResultAd(false);
      return;
    }
    if (hasShownResultAd) return;
    setHasShownResultAd(true);
    void tryShowContextualInterstitial();
  }, [gross, hasShownResultAd, tryShowContextualInterstitial]);

  const onSelectCountry = useCallback(
    (target: 'A' | 'B', value: Country) => {
      const sameSelection =
        (target === 'A' && value.code === countryA.code) ||
        (target === 'B' && value.code === countryB.code);
      if (sameSelection) return;
      if (!comparisonGate.allowed) {
        setUnlockVisible(true);
        return;
      }
      if (target === 'A') {
        setCountryA(value);
      } else {
        setCountryB(value);
      }
      incrementComparisonUsage();
      void tryShowContextualInterstitial();
    },
    [
      comparisonGate.allowed,
      countryA.code,
      countryB.code,
      incrementComparisonUsage,
      tryShowContextualInterstitial,
    ]
  );

  const handleUnlockComparison = useCallback(async () => {
    const result = await unlockFeature('comparison');
    if (result === 'rewarded') {
      setUnlockVisible(false);
    }
  }, [unlockFeature]);

  const handleUnlockAdFree = useCallback(async () => {
    const result = await unlockAdFree();
    if (result === 'rewarded') {
      setUnlockVisible(false);
    }
  }, [unlockAdFree]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Comparaison</Text>

        <AmountInput value={salary} onChangeText={setSalary} label="Salaire brut mensuel" symbol="€" />

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Pays A</Text>
        <CountryPicker selected={countryA.code} onSelect={(country) => onSelectCountry('A', country)} theme={theme} />

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Pays B</Text>
        <CountryPicker selected={countryB.code} onSelect={(country) => onSelectCountry('B', country)} theme={theme} />

        {isLimitedMode ? (
          <Text style={[styles.lockHint, { color: theme.warning }]}>
            Comparaison gratuite limitée à 1. Débloquer avec une publicité.
          </Text>
        ) : null}

        {gross <= 0 && <EmptyState icon="⚖️" title={LABELS.emptyCompare} message={LABELS.emptyCompareMsg} />}

        {gross > 0 && (
          <>
            <AppCard>
              <View style={styles.compareRow}>
                <View style={styles.compareCol}>
                  <Text style={styles.compareFlag}>{countryA.flag}</Text>
                  <Text style={[styles.compareCountry, { color: theme.text }]}>{countryA.name}</Text>
                  <Text style={[styles.compareNet, { color: theme.primary }]}>
                    {formatCurrency(netA, countryA.currencySymbol)}
                  </Text>
                  <Text style={[styles.compareTax, { color: theme.textMuted }]}>
                    {(countryA.taxRate * 100).toFixed(0)}% charges
                  </Text>
                </View>
                <View style={[styles.compareDivider, { backgroundColor: theme.border }]} />
                <View style={styles.compareCol}>
                  <Text style={styles.compareFlag}>{countryB.flag}</Text>
                  <Text style={[styles.compareCountry, { color: theme.text }]}>{countryB.name}</Text>
                  <Text style={[styles.compareNet, { color: theme.primary }]}>
                    {formatCurrency(netB, countryB.currencySymbol)}
                  </Text>
                  <Text style={[styles.compareTax, { color: theme.textMuted }]}>
                    {(countryB.taxRate * 100).toFixed(0)}% charges
                  </Text>
                </View>
              </View>
            </AppCard>

            <AppCard>
              <Text style={[styles.diffLabel, { color: theme.textSecondary }]}>Différence nette/mois</Text>
              <Text style={[styles.diffValue, { color: diff >= 0 ? theme.success : theme.danger }]}>
                {diff >= 0 ? '+' : ''}
                {formatCurrency(diff, '€')}
              </Text>
            </AppCard>

            <AppCard>
              <SalaryChart gross={gross} net={netA} symbol={countryA.currencySymbol} />
              <View style={{ height: 12 }} />
              <SalaryChart gross={gross} net={netB} symbol={countryB.currencySymbol} />
            </AppCard>
          </>
        )}
      </ScrollView>

      <AdUnlockModal
        visible={unlockVisible}
        onClose={() => setUnlockVisible(false)}
        onWatchAd={handleUnlockComparison}
        onAdFree={handleUnlockAdFree}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  lockHint: { fontSize: 12, marginBottom: 6, fontWeight: '600' },
  countryRow: { gap: 6, paddingVertical: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  chipFlag: { fontSize: 14 },
  chipText: { fontSize: 12, fontWeight: '600' },
  compareRow: { flexDirection: 'row', alignItems: 'center' },
  compareCol: { flex: 1, alignItems: 'center', gap: 2 },
  compareDivider: { width: 1, height: 60, marginHorizontal: 8 },
  compareFlag: { fontSize: 28 },
  compareCountry: { fontSize: 13, fontWeight: '600' },
  compareNet: { fontSize: 18, fontWeight: '900' },
  compareTax: { fontSize: 11 },
  diffLabel: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  diffValue: { fontSize: 22, fontWeight: '900' },
});
