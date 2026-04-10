import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { AppCard } from '../../components/AppCard';
import { AmountInput } from '../../components/AmountInput';
import { SalaryChart } from '../../components/SalaryChart';
import { countries } from '../../data';
import { grossToNet } from '../../utils/salary';
import { formatCurrency, parseInputAmount } from '../../utils/format';
import type { Country } from '../../types';

function CountryPicker({ selected, onSelect, theme }: { selected: string; onSelect: (c: Country) => void; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.countryRow}>
      {countries.map((c) => (
        <TouchableOpacity
          key={c.code}
          style={[styles.chip, { backgroundColor: c.code === selected ? theme.primary : theme.surfaceLight, borderColor: c.code === selected ? theme.primary : theme.border }]}
          onPress={() => onSelect(c)}
        >
          <Text style={styles.chipFlag}>{c.flag}</Text>
          <Text style={[styles.chipText, { color: c.code === selected ? '#FFF' : theme.text }]}>{c.code}</Text>
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

  const gross = parseInputAmount(salary);
  const netA = useMemo(() => grossToNet(gross, countryA.taxRate), [gross, countryA.taxRate]);
  const netB = useMemo(() => grossToNet(gross, countryB.taxRate), [gross, countryB.taxRate]);
  const diff = netA - netB;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Comparaison</Text>

        <AmountInput value={salary} onChangeText={setSalary} label="Salaire brut mensuel" symbol="€" />

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Pays A</Text>
        <CountryPicker selected={countryA.code} onSelect={setCountryA} theme={theme} />

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Pays B</Text>
        <CountryPicker selected={countryB.code} onSelect={setCountryB} theme={theme} />

        {gross > 0 && (
          <>
            <AppCard>
              <View style={styles.compareRow}>
                <View style={styles.compareCol}>
                  <Text style={[styles.compareFlag]}>{countryA.flag}</Text>
                  <Text style={[styles.compareCountry, { color: theme.text }]}>{countryA.name}</Text>
                  <Text style={[styles.compareNet, { color: theme.primary }]}>{formatCurrency(netA, countryA.currencySymbol)}</Text>
                  <Text style={[styles.compareTax, { color: theme.textMuted }]}>{(countryA.taxRate * 100).toFixed(0)}% charges</Text>
                </View>
                <View style={[styles.compareDivider, { backgroundColor: theme.border }]} />
                <View style={styles.compareCol}>
                  <Text style={[styles.compareFlag]}>{countryB.flag}</Text>
                  <Text style={[styles.compareCountry, { color: theme.text }]}>{countryB.name}</Text>
                  <Text style={[styles.compareNet, { color: theme.primary }]}>{formatCurrency(netB, countryB.currencySymbol)}</Text>
                  <Text style={[styles.compareTax, { color: theme.textMuted }]}>{(countryB.taxRate * 100).toFixed(0)}% charges</Text>
                </View>
              </View>
            </AppCard>

            <AppCard>
              <Text style={[styles.diffLabel, { color: theme.textSecondary }]}>Différence nette/mois</Text>
              <Text style={[styles.diffValue, { color: diff >= 0 ? theme.success : theme.danger }]}>
                {diff >= 0 ? '+' : ''}{formatCurrency(diff, '€')}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  countryRow: { gap: 6, paddingVertical: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, gap: 4 },
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
