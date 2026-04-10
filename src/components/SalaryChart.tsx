import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../features/theme/ThemeProvider';
import { formatCompactCurrency } from '../utils/format';

interface SalaryChartProps {
  gross: number;
  net: number;
  symbol: string;
}

function AnimatedBar({ value, maxValue, color, label, amount, symbol }: {
  value: number; maxValue: number; color: string; label: string; amount: number; symbol: string;
}) {
  const { theme } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [pct, widthAnim]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.barContainer}>
      <View style={styles.barHeader}>
        <Text style={[styles.barLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.barAmount, { color }]}>{formatCompactCurrency(amount, symbol)}</Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: theme.surfaceLight }]}>
        <Animated.View style={[styles.barFill, { backgroundColor: color, width }]} />
      </View>
    </View>
  );
}

export const SalaryChart = React.memo(function SalaryChart({ gross, net, symbol }: SalaryChartProps) {
  const { theme } = useTheme();
  const maxVal = Math.max(gross, net, 1);

  return (
    <View style={styles.container}>
      <AnimatedBar value={gross} maxValue={maxVal} color={theme.textSecondary} label="Brut" amount={gross} symbol={symbol} />
      <AnimatedBar value={net} maxValue={maxVal} color={theme.primary} label="Net" amount={net} symbol={symbol} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 10 },
  barContainer: { gap: 4 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barLabel: { fontSize: 12, fontWeight: '600' },
  barAmount: { fontSize: 13, fontWeight: '700' },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
});
