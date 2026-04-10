import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share, BackHandler, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../features/theme/ThemeProvider';
import { useSalaryStore } from '../../store/salaryStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { AppCard } from '../../components/AppCard';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ResultGrid } from '../../components/ResultGrid';
import { CustomKeyboard } from '../../components/CustomKeyboard';
import { SalaryBreakdownModal } from '../../components/SalaryBreakdownModal';
import { SalaryChart } from '../../components/SalaryChart';
import { HistoryItemRow } from '../../components/HistoryItem';
import { EditableFieldWrapper } from '../../components/EditableFieldWrapper';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { PressableScale } from '../../components/PressableScale';
import { EmptyState } from '../../components/EmptyState';
import { QuickModeScreen } from './QuickModeScreen';
import { getCountryByCode, getSmicForCountry } from '../../data';
import { formatCurrency } from '../../utils/format';
import { parseSalaryInput } from '../../utils/parseSalaryInput';
import { formatShareText } from '../../features/share/formatShareText';
import { getSmartSuggestion } from '../../features/salary/getSmartSuggestion';
import { useHistory, type SortMode } from '../../features/history/useHistory';
import { APP_NAME, LABELS } from '../../constants/appName';
import type { SalaryResults } from '../../types';

export function HomeScreen() {
  const { theme } = useTheme();
  const inputValue = useSalaryStore((s) => s.inputValue);
  const inputType = useSalaryStore((s) => s.inputType);
  const period = useSalaryStore((s) => s.period);
  const results = useSalaryStore((s) => s.results);
  const recentValues = useSalaryStore((s) => s.recentValues);
  const activeField = useSalaryStore((s) => s.activeField);
  const taxRate = useSalaryStore((s) => s.taxRate);
  const pasEnabled = useSalaryStore((s) => s.pasEnabled);
  const pasRate = useSalaryStore((s) => s.pasRate);
  const setInputValue = useSalaryStore((s) => s.setInputValue);
  const setInputType = useSalaryStore((s) => s.setInputType);
  const setPeriod = useSalaryStore((s) => s.setPeriod);
  const setActiveField = useSalaryStore((s) => s.setActiveField);
  const updateFromField = useSalaryStore((s) => s.updateFromField);
  const fillSmic = useSalaryStore((s) => s.fillSmic);
  const addQuickAmount = useSalaryStore((s) => s.addQuickAmount);
  const saveSimulation = useSalaryStore((s) => s.saveSimulation);
  const country = useOnboardingStore((s) => s.country);

  const countryData = getCountryByCode(country);
  const symbol = countryData?.currencySymbol ?? '€';
  const smicValue = getSmicForCountry(country);

  const scrollRef = useRef<ScrollView>(null);
  const inputYRef = useRef(0);
  const gridYRef = useRef(0);
  const suggestionFade = useRef(new Animated.Value(0)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [breakdownVisible, setBreakdownVisible] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [editingField, setEditingField] = useState<keyof SalaryResults | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [historySortMode, setHistorySortMode] = useState<SortMode>('date');

  const { items: historyItems, remove: removeHistory, load: loadHistory, toggleFavorite } = useHistory(historySortMode);

  const suggestion = useMemo(
    () => getSmartSuggestion(results.netMonthly, results.grossMonthly, country),
    [results.netMonthly, results.grossMonthly, country]
  );

  useEffect(() => {
    Animated.timing(suggestionFade, {
      toValue: suggestion ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [suggestion, suggestionFade]);

  const openKeyboard = useCallback(() => setKeyboardVisible(true), []);
  const closeKeyboard = useCallback(() => setKeyboardVisible(false), []);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (quickMode) { setQuickMode(false); return true; }
      if (breakdownVisible) { setBreakdownVisible(false); return true; }
      if (keyboardVisible) { setKeyboardVisible(false); return true; }
      return false;
    });
    return () => handler.remove();
  }, [keyboardVisible, breakdownVisible, quickMode]);

  const scrollToFocused = useCallback((y: number) => {
    setTimeout(() => { scrollRef.current?.scrollTo({ y: Math.max(0, y - 60), animated: true }); }, 100);
  }, []);

  const handleTypeChange = useCallback((i: number) => setInputType(i === 0 ? 'gross' : 'net'), [setInputType]);
  const handlePeriodChange = useCallback((i: number) => setPeriod((['monthly', 'yearly', 'daily'] as const)[i]), [setPeriod]);

  const handleKeyPress = useCallback((key: string) => {
    if (editingField) {
      setEditBuffer((prev) => {
        if (key === '.' && prev.includes('.')) return prev;
        const newBuf = prev + key;
        updateFromField(editingField, parseSalaryInput(newBuf));
        return newBuf;
      });
    } else {
      setInputValue(inputValue + key);
    }
  }, [inputValue, setInputValue, editingField, updateFromField]);

  const handleDelete = useCallback(() => {
    if (editingField) {
      setEditBuffer((prev) => {
        const newBuf = prev.slice(0, -1);
        updateFromField(editingField, parseSalaryInput(newBuf));
        return newBuf;
      });
    } else {
      setInputValue(inputValue.slice(0, -1));
    }
  }, [inputValue, setInputValue, editingField, updateFromField]);

  const handleFieldPress = useCallback((field: keyof SalaryResults) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingField(field);
    setEditBuffer('');
    updateFromField(field, 0);
    setActiveField(field);
    openKeyboard();
    scrollToFocused(gridYRef.current);
  }, [setActiveField, openKeyboard, updateFromField, scrollToFocused]);

  const handleInputAreaPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingField(null);
    setEditBuffer('');
    setInputValue('');
    setActiveField('input');
    openKeyboard();
    scrollToFocused(inputYRef.current);
  }, [setActiveField, openKeyboard, setInputValue, scrollToFocused]);

  const handleRecentSelect = useCallback((val: number) => {
    setInputValue(val.toString());
    setEditingField(null);
    setActiveField('input');
  }, [setInputValue, setActiveField]);

  const handleSmicPress = useCallback(() => {
    if (smicValue) { fillSmic(smicValue); setEditingField(null); }
  }, [smicValue, fillSmic]);

  const shareText = formatShareText({
    inputType, inputValue, results, symbol,
    countryName: countryData?.name, countryFlag: countryData?.flag,
  });

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try { await Share.share({ message: shareText }); } catch (_) {}
  };

  const handleAutoSave = useCallback(() => {
    if (parseSalaryInput(inputValue) > 0) {
      saveSimulation('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [inputValue, saveSimulation]);

  const periodIndex = period === 'monthly' ? 0 : period === 'yearly' ? 1 : 2;

  if (quickMode) {
    return <QuickModeScreen onClose={() => setQuickMode(false)} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.flex}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={[styles.appTitle, { color: theme.text }]}>{APP_NAME}</Text>
              <Text style={styles.flag}>{countryData?.flag}</Text>
            </View>
            <View style={styles.headerActions}>
              <PressableScale onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setQuickMode(true); }}>
                <View style={[styles.quickBtn, { borderColor: theme.primary }]}>
                  <Text style={[styles.quickBtnText, { color: theme.primary }]}>⚡</Text>
                </View>
              </PressableScale>
              <PressableScale onPress={handleShare}>
                <Text style={styles.headerIcon}>📤</Text>
              </PressableScale>
              <PressableScale onPress={handleAutoSave}>
                <Text style={styles.headerIcon}>💾</Text>
              </PressableScale>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <AppCard style={styles.summaryCard}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{LABELS.grossMonthly}</Text>
              <AnimatedNumber value={results.grossMonthly} symbol={symbol} style={[styles.summaryValue, { color: theme.text }]} />
            </AppCard>
            <AppCard style={styles.summaryCard}>
              <Text style={[styles.summaryLabel, { color: theme.primary }]}>{LABELS.netMonthly}</Text>
              <AnimatedNumber value={results.netMonthly} symbol={symbol} style={[styles.summaryValue, { color: theme.primary }]} />
            </AppCard>
          </View>

          {results.grossMonthly > 0 && (
            <AppCard>
              <SalaryChart gross={results.grossMonthly} net={results.netMonthly} symbol={symbol} />
              <PressableScale onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBreakdownVisible(true); }}>
                <View style={[styles.detailBtn, { borderColor: theme.border }]}>
                  <Text style={[styles.detailBtnText, { color: theme.primary }]}>{LABELS.details}</Text>
                </View>
              </PressableScale>
            </AppCard>
          )}

          {suggestion && results.grossMonthly > 0 && (
            <Animated.View style={{ opacity: suggestionFade }}>
              <AppCard style={{ borderColor: theme.primary + '40' }}>
                <Text style={[styles.suggestionFlag]}>{suggestion.flag}</Text>
                <Text style={[styles.suggestionCountry, { color: theme.text }]}>{suggestion.countryName}</Text>
                <Text style={[styles.suggestionDiff, { color: theme.success }]}>
                  +{formatCurrency(suggestion.difference, symbol)}/mois net
                </Text>
              </AppCard>
            </Animated.View>
          )}

          <View style={styles.controlsRow}>
            <View style={styles.controlHalf}>
              <SegmentedControl values={[LABELS.gross, LABELS.net]} selectedIndex={inputType === 'gross' ? 0 : 1} onChange={handleTypeChange} />
            </View>
            <View style={styles.controlHalf}>
              <SegmentedControl values={[LABELS.monthly, LABELS.yearly, LABELS.daily]} selectedIndex={periodIndex} onChange={handlePeriodChange} />
            </View>
          </View>

          <View onLayout={(e) => { inputYRef.current = e.nativeEvent.layout.y; }}>
            <TouchableOpacity onPress={handleInputAreaPress} activeOpacity={0.9}>
              <EditableFieldWrapper isActive={activeField === 'input'}>
                <View style={styles.inputInner}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    {inputType === 'gross' ? LABELS.gross : LABELS.net} {period === 'monthly' ? LABELS.monthlyFull : period === 'yearly' ? LABELS.yearlyFull : LABELS.dailyFull}
                  </Text>
                  <Text style={[styles.inputDisplay, { color: theme.text }]}>
                    {inputValue || '0'} {symbol}
                  </Text>
                </View>
              </EditableFieldWrapper>
            </TouchableOpacity>
          </View>

          <View style={{ height: 8 }} />

          <View onLayout={(e) => { gridYRef.current = e.nativeEvent.layout.y; }}>
            <AppCard>
              <ResultGrid results={results} symbol={symbol} activeField={activeField} onFieldPress={handleFieldPress} />
            </AppCard>
          </View>

          <AppCard>
            <View style={styles.historyHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{LABELS.history}</Text>
              {historyItems.length > 0 && (
                <PressableScale onPress={() => setHistorySortMode((m) => m === 'date' ? 'amount' : 'date')}>
                  <Text style={[styles.sortBtn, { color: theme.textMuted }]}>
                    {historySortMode === 'date' ? '📅' : '💰'}
                  </Text>
                </PressableScale>
              )}
            </View>
            {historyItems.length === 0 ? (
              <EmptyState icon="📋" title={LABELS.emptyHistory} message={LABELS.emptyHistoryMsg} />
            ) : (
              historyItems.slice(0, 8).map((item) => (
                <HistoryItemRow
                  key={item.id}
                  item={item}
                  symbol={symbol}
                  onPress={() => loadHistory(item)}
                  onDelete={() => removeHistory(item.id)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              ))
            )}
          </AppCard>

          <View style={styles.bottomPad} />
        </ScrollView>

        <CustomKeyboard
          visible={keyboardVisible}
          onClose={closeKeyboard}
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          recentValues={recentValues}
          onRecentSelect={handleRecentSelect}
          onQuickAdd={addQuickAmount}
          smicValue={smicValue}
          onSmicPress={handleSmicPress}
          currencySymbol={symbol}
        />
      </View>

      <SalaryBreakdownModal
        visible={breakdownVisible}
        onClose={() => setBreakdownVisible(false)}
        grossMonthly={results.grossMonthly}
        taxRate={taxRate}
        pasEnabled={pasEnabled}
        pasRate={pasRate}
        symbol={symbol}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appTitle: { fontSize: 22, fontWeight: '800' },
  flag: { fontSize: 18 },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  quickBtn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  quickBtnText: { fontSize: 16 },
  headerIcon: { fontSize: 17, padding: 4 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 0 },
  summaryCard: { flex: 1, marginBottom: 8 },
  summaryLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  summaryValue: { fontSize: 20, fontWeight: '900' },
  detailBtn: { marginTop: 8, paddingVertical: 8, borderTopWidth: 1, alignItems: 'center' },
  detailBtnText: { fontSize: 13, fontWeight: '700' },
  suggestionFlag: { fontSize: 24, textAlign: 'center' },
  suggestionCountry: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  suggestionDiff: { fontSize: 16, fontWeight: '800', textAlign: 'center', marginTop: 2 },
  controlsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  controlHalf: { flex: 1 },
  inputInner: { padding: 12 },
  inputLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  inputDisplay: { fontSize: 22, fontWeight: '800' },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sortBtn: { fontSize: 16, padding: 2 },
  bottomPad: { height: 20 },
});
