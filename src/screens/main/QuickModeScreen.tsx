import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../features/theme/ThemeProvider';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useSalaryStore } from '../../store/salaryStore';
import { getCountryByCode } from '../../data';
import { recalculateFromInput } from '../../utils/salary';
import { parseSalaryInput } from '../../utils/parseSalaryInput';
import { CustomKeyboard } from '../../components/CustomKeyboard';
import { EditableFieldWrapper } from '../../components/EditableFieldWrapper';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { PressableScale } from '../../components/PressableScale';
import { APP_NAME } from '../../constants/appName';
import type { SalaryInputType } from '../../types';

interface QuickModeProps {
  onClose: () => void;
}

export function QuickModeScreen({ onClose }: QuickModeProps) {
  const { theme } = useTheme();
  const country = useOnboardingStore((s) => s.country);
  const pasEnabled = useOnboardingStore((s) => s.pasEnabled);
  const pasRate = useOnboardingStore((s) => s.pasRate);
  const lastInputType = useSalaryStore((s) => s.inputType);
  const countryData = getCountryByCode(country);
  const symbol = countryData?.currencySymbol ?? '€';
  const taxRate = countryData?.taxRate ?? 0.23;

  const [value, setValue] = useState('');
  const [inputType, setInputType] = useState<SalaryInputType>(lastInputType);

  const numValue = parseSalaryInput(value);
  const results = recalculateFromInput(numValue, inputType, 'monthly', { taxRate, pasEnabled, pasRate });
  const resultValue = inputType === 'gross' ? results.netMonthly : results.grossMonthly;
  const resultLabel = inputType === 'gross' ? 'Net mensuel' : 'Brut mensuel';

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => { onClose(); return true; });
    return () => handler.remove();
  }, [onClose]);

  const handleKeyPress = useCallback((key: string) => {
    setValue((prev) => {
      if (key === '.' && prev.includes('.')) return prev;
      return prev + key;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setValue((prev) => prev.slice(0, -1));
  }, []);

  const toggleType = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInputType((t) => t === 'gross' ? 'net' : 'gross');
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{APP_NAME}</Text>
        <Text style={[styles.badge, { color: theme.primary }]}>⚡ Quick</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.inputTypeLabel, { color: theme.textSecondary }]}>
          {inputType === 'gross' ? 'Brut mensuel' : 'Net mensuel'}
        </Text>

        <EditableFieldWrapper isActive={true}>
          <View style={styles.inputBox}>
            <Text style={[styles.inputText, { color: theme.text }]}>
              {value || '0'} {symbol}
            </Text>
          </View>
        </EditableFieldWrapper>

        <Text style={[styles.arrow, { color: theme.textMuted }]}>↓</Text>

        <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>{resultLabel}</Text>
        <AnimatedNumber
          value={resultValue}
          symbol={symbol}
          style={[styles.resultValue, { color: theme.primary }]}
          duration={250}
        />

        <PressableScale onPress={toggleType}>
          <View style={[styles.toggleBtn, { borderColor: theme.primary }]}>
            <Text style={[styles.toggleBtnText, { color: theme.primary }]}>
              {inputType === 'gross' ? 'Saisir en Net →' : '← Saisir en Brut'}
            </Text>
          </View>
        </PressableScale>
      </View>

      <CustomKeyboard
        visible={true}
        onClose={onClose}
        onKeyPress={handleKeyPress}
        onDelete={handleDelete}
        currencySymbol={symbol}
        smicValue={countryData?.smic}
        onSmicPress={() => { if (countryData?.smic) setValue(countryData.smic.toString()); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 8, gap: 8 },
  title: { fontSize: 20, fontWeight: '800' },
  badge: { fontSize: 13, fontWeight: '700' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  inputTypeLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputBox: { paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  inputText: { fontSize: 36, fontWeight: '900' },
  arrow: { fontSize: 24, marginVertical: 12 },
  resultLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  resultValue: { fontSize: 42, fontWeight: '900' },
  toggleBtn: { marginTop: 20, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  toggleBtnText: { fontSize: 14, fontWeight: '700' },
});
