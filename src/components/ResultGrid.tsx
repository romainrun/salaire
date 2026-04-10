import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../features/theme/ThemeProvider';
import { EditableValue } from './EditableValue';
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
  activeField = 'input',
  onFieldPress,
}: ResultGridProps) {
  const { theme } = useTheme();

  const handlePress = useCallback(
    (field: keyof SalaryResults) => {
      onFieldPress?.(field);
    },
    [onFieldPress]
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.labelCol} />
        <Text style={[styles.headerText, { color: theme.textSecondary }]}>Brut</Text>
        <Text style={[styles.headerText, { color: theme.primary }]}>Net</Text>
      </View>

      <Text style={[styles.periodLabel, { color: theme.textMuted }]}>Mensuel</Text>
      <View style={styles.valueRow}>
        <EditableValue
          label="Brut"
          value={results.grossMonthly}
          symbol={symbol}
          isActive={activeField === 'grossMonthly'}
          onPress={() => handlePress('grossMonthly')}
        />
        <EditableValue
          label="Net"
          value={results.netMonthly}
          symbol={symbol}
          isActive={activeField === 'netMonthly'}
          isPrimary
          onPress={() => handlePress('netMonthly')}
        />
      </View>

      <Text style={[styles.periodLabel, { color: theme.textMuted }]}>Annuel</Text>
      <View style={styles.valueRow}>
        <EditableValue
          label="Brut"
          value={results.grossYearly}
          symbol={symbol}
          isActive={activeField === 'grossYearly'}
          onPress={() => handlePress('grossYearly')}
        />
        <EditableValue
          label="Net"
          value={results.netYearly}
          symbol={symbol}
          isActive={activeField === 'netYearly'}
          isPrimary
          onPress={() => handlePress('netYearly')}
        />
      </View>

      <Text style={[styles.periodLabel, { color: theme.textMuted }]}>Journalier</Text>
      <View style={styles.valueRow}>
        <EditableValue
          label="Brut"
          value={results.grossDaily}
          symbol={symbol}
          isActive={activeField === 'grossDaily'}
          onPress={() => handlePress('grossDaily')}
        />
        <EditableValue
          label="Net"
          value={results.netDaily}
          symbol={symbol}
          isActive={activeField === 'netDaily'}
          isPrimary
          onPress={() => handlePress('netDaily')}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  labelCol: {
    flex: 1,
  },
  headerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
