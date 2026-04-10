import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../features/theme/ThemeProvider';
import type { SalaryResults } from '../types';
import { formatCurrency } from '../utils/format';

interface ResultGridProps {
  results: SalaryResults;
  symbol?: string;
}

export const ResultGrid = React.memo(function ResultGrid({
  results,
  symbol = '\u20ac',
}: ResultGridProps) {
  const { theme } = useTheme();

  const rows = useMemo(
    () => [
      { label: 'Mensuel', gross: results.grossMonthly, net: results.netMonthly },
      { label: 'Annuel', gross: results.grossYearly, net: results.netYearly },
      { label: 'Journalier', gross: results.grossDaily, net: results.netDaily },
    ],
    [results]
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.labelCol} />
        <Text style={[styles.headerText, { color: theme.textSecondary }]}>
          Brut
        </Text>
        <Text style={[styles.headerText, { color: theme.primary }]}>
          Net
        </Text>
      </View>
      {rows.map((row) => (
        <View
          key={row.label}
          style={[styles.row, { borderBottomColor: theme.border }]}
        >
          <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>
            {row.label}
          </Text>
          <Text style={[styles.rowValue, { color: theme.text }]}>
            {formatCurrency(row.gross, symbol)}
          </Text>
          <Text style={[styles.rowValue, { color: theme.primary }]}>
            {formatCurrency(row.net, symbol)}
          </Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  labelCol: {
    flex: 1,
  },
  headerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  rowValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
});
