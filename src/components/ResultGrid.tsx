import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../features/theme/ThemeProvider';
import type { SalaryResults } from '../types';

interface ResultGridProps {
  results: SalaryResults;
  symbol?: string;
  activeField?: keyof SalaryResults | 'input';
  onFieldPress?: (field: keyof SalaryResults) => void;
}

export const ResultGrid = React.memo(function ResultGrid({
  results,
  symbol = '€',
}: ResultGridProps) {
  const { theme } = useTheme();
  const formatValue = (value: number) => `${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} ${symbol}`;

  return (
    <View style={styles.container}>
      <View style={styles.periodSection}>
        <Text style={[styles.periodLabel, { color: theme.textMuted }]}>Mensuel</Text>
        <View style={styles.row}>
          <View style={[styles.col, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textMuted }]}>BRUT</Text>
            <Text style={[styles.value, { color: theme.text }]}>{formatValue(results.grossMonthly)}</Text>
          </View>
          <View style={[styles.col, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textMuted }]}>NET</Text>
            <Text style={[styles.value, { color: theme.primary }]}>{formatValue(results.netMonthly)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.periodSection}>
        <Text style={[styles.periodLabel, { color: theme.textMuted }]}>Annuel</Text>
        <View style={styles.row}>
          <View style={[styles.col, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textMuted }]}>BRUT</Text>
            <Text style={[styles.value, { color: theme.text }]}>{formatValue(results.grossYearly)}</Text>
          </View>
          <View style={[styles.col, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textMuted }]}>NET</Text>
            <Text style={[styles.value, { color: theme.primary }]}>{formatValue(results.netYearly)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.periodSection}>
        <Text style={[styles.periodLabel, { color: theme.textMuted }]}>Journalier</Text>
        <View style={styles.row}>
          <View style={[styles.col, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textMuted }]}>BRUT</Text>
            <Text style={[styles.value, { color: theme.text }]}>{formatValue(results.grossDaily)}</Text>
          </View>
          <View style={[styles.col, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textMuted }]}>NET</Text>
            <Text style={[styles.value, { color: theme.primary }]}>{formatValue(results.netDaily)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { width: '100%' },
  periodSection: { marginBottom: 12 },
  periodLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  col: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
});
