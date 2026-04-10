import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { useTheme } from '../features/theme/ThemeProvider';
import { computeBreakdown, type SalaryBreakdown } from '../features/salary/breakdown';
import { formatCurrency } from '../utils/format';

interface Props {
  visible: boolean;
  onClose: () => void;
  grossMonthly: number;
  taxRate: number;
  pasEnabled: boolean;
  pasRate: number;
  symbol: string;
  bonus?: number;
  thirteenthMonth?: boolean;
}

function AnimatedRow({ label, value, color, symbol, delay }: {
  label: string; value: number; color: string; symbol: string; delay: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 300, delay, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateX, delay]);

  return (
    <Animated.View style={[styles.row, { opacity, transform: [{ translateX }] }]}>
      <Text style={[styles.rowLabel, { color }]}>{label}</Text>
      <Text style={[styles.rowValue, { color }]}>{formatCurrency(value, symbol)}</Text>
    </Animated.View>
  );
}

export function SalaryBreakdownModal({ visible, onClose, grossMonthly, taxRate, pasEnabled, pasRate, symbol, bonus = 0, thirteenthMonth = false }: Props) {
  const { theme } = useTheme();

  const breakdown = computeBreakdown({ grossMonthly, taxRate, pasEnabled, pasRate, bonus, thirteenthMonth });

  const rows: { label: string; value: number; color: string }[] = [
    { label: 'Salaire brut', value: breakdown.grossMonthly, color: theme.text },
    ...(breakdown.thirteenthMonth > 0 ? [{ label: '  dont 13e mois', value: breakdown.thirteenthMonth, color: theme.textSecondary }] : []),
    ...(breakdown.bonus > 0 ? [{ label: '  dont prime', value: breakdown.bonus, color: theme.textSecondary }] : []),
    { label: `Charges (${breakdown.chargesPercent.toFixed(0)}%)`, value: -breakdown.charges, color: theme.danger },
    { label: 'Net avant impôt', value: breakdown.netBeforeTax, color: theme.text },
    ...(pasEnabled ? [{ label: `PAS (${breakdown.pasPercent.toFixed(1)}%)`, value: -breakdown.pas, color: theme.warning }] : []),
    { label: 'Net final', value: breakdown.netFinal, color: theme.primary },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Détail du salaire</Text>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {rows.map((row, i) => (
            <AnimatedRow key={row.label} label={row.label} value={row.value} color={row.color} symbol={symbol} delay={i * 60} />
          ))}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.closeBtnText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { borderRadius: 16, padding: 20, borderWidth: 1 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  divider: { height: 1, marginVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontSize: 14, fontWeight: '500' },
  rowValue: { fontSize: 14, fontWeight: '700' },
  closeBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  closeBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
