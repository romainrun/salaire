import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share, BackHandler, Clipboard } from 'react-native';
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
import { getCountryByCode, getSmicForCountry } from '../../data';
import { formatCurrency } from '../../utils/format';
import { parseSalaryInput } from '../../utils/parseSalaryInput';
import { formatShareText } from '../../features/share/formatShareText';
import { useHistory, type SortMode } from '../../features/history/useHistory';
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
  const recalculate = useSalaryStore((s) => s.recalculate);
  const country = useOnboardingStore((s) => s.country);

  const countryData = getCountryByCode(country);
  const symbol = countryData?.currencySymbol ?? '€';
  const smicValue = getSmicForCountry(country);

  const scrollRef = useRef<ScrollView>(null);
  const inputYRef = useRef(0);
  const gridYRef = useRef(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [breakdownVisible, setBreakdownVisible] = useState(false);
  const [editingField, setEditingField] = useState<keyof SalaryResults | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [historySortMode, setHistorySortMode] = useState<SortMode>('date');

  const { items: historyItems, remove: removeHistory, load: loadHistory, toggleFavorite } = useHistory(historySortMode);

  const openKeyboard = useCallback(() => setKeyboardVisible(true), []);
  const closeKeyboard = useCallback(() => setKeyboardVisible(false), []);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (breakdownVisible) { setBreakdownVisible(false); return true; }
      if (keyboardVisible) { setKeyboardVisible(false); return true; }
      return false;
    });
    return () => handler.remove();
  }, [keyboardVisible, breakdownVisible]);

  const scrollToFocused = useCallback((y: number) => {
    setTimeout(() => { scrollRef.current?.scrollTo({ y: Math.max(0, y - 60), animated: true }); }, 100);
  }, []);

  const handleTypeChange = useCallback((i: number) => setInputType(i === 0 ? 'gross' : 'net'), [setInputType]);
  const handlePeriodChange = useCallback((i: number) => {
    setPeriod((['monthly', 'yearly', 'daily'] as const)[i]);
  }, [setPeriod]);

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
    setEditingField(field);
    setEditBuffer('');
    updateFromField(field, 0);
    setActiveField(field);
    openKeyboard();
    scrollToFocused(gridYRef.current);
  }, [setActiveField, openKeyboard, updateFromField, scrollToFocused]);

  const handleInputAreaPress = useCallback(() => {
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
    try { await Share.share({ message: shareText }); } catch (_) {}
  };

  const handleCopy = () => {
    Clipboard.setString(shareText);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAutoSave = useCallback(() => {
    if (parseSalaryInput(inputValue) > 0) saveSimulation('');
  }, [inputValue, saveSimulation]);

  const periodIndex = period === 'monthly' ? 0 : period === 'yearly' ? 1 : 2;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.flex}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={[styles.appTitle, { color: theme.text }]}>Salaire</Text>
              <Text style={styles.flag}>{countryData?.flag}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleCopy} style={styles.headerBtn}><Text style={styles.headerIcon}>📋</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.headerBtn}><Text style={styles.headerIcon}>📤</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleAutoSave} style={styles.headerBtn}><Text style={styles.headerIcon}>💾</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <AppCard style={styles.summaryCard}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Brut mensuel</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(results.grossMonthly, symbol)}
              </Text>
            </AppCard>
            <AppCard style={styles.summaryCard}>
              <Text style={[styles.summaryLabel, { color: theme.primary }]}>Net mensuel</Text>
              <Text style={[styles.summaryValue, { color: theme.primary }]} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(results.netMonthly, symbol)}
              </Text>
            </AppCard>
          </View>

          {results.grossMonthly > 0 && (
            <AppCard>
              <SalaryChart gross={results.grossMonthly} net={results.netMonthly} symbol={symbol} />
              <TouchableOpacity onPress={() => setBreakdownVisible(true)} style={[styles.detailBtn, { borderColor: theme.border }]}>
                <Text style={[styles.detailBtnText, { color: theme.primary }]}>Voir le détail</Text>
              </TouchableOpacity>
            </AppCard>
          )}

          <View style={styles.controlsRow}>
            <View style={styles.controlHalf}>
              <SegmentedControl values={['Brut', 'Net']} selectedIndex={inputType === 'gross' ? 0 : 1} onChange={handleTypeChange} />
            </View>
            <View style={styles.controlHalf}>
              <SegmentedControl values={['Mois', 'An', 'Jour']} selectedIndex={periodIndex} onChange={handlePeriodChange} />
            </View>
          </View>

          <View onLayout={(e) => { inputYRef.current = e.nativeEvent.layout.y; }}>
            <TouchableOpacity onPress={handleInputAreaPress} activeOpacity={0.9}>
              <AppCard style={activeField === 'input' ? { borderColor: theme.primary, borderWidth: 1.5 } : undefined}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  {inputType === 'gross' ? 'Brut' : 'Net'} {period === 'monthly' ? 'mensuel' : period === 'yearly' ? 'annuel' : 'journalier'}
                </Text>
                <Text style={[styles.inputDisplay, { color: theme.text }]}>
                  {inputValue || '0'} {symbol}
                </Text>
              </AppCard>
            </TouchableOpacity>
          </View>

          <View onLayout={(e) => { gridYRef.current = e.nativeEvent.layout.y; }}>
            <AppCard>
              <ResultGrid results={results} symbol={symbol} activeField={activeField} onFieldPress={handleFieldPress} />
            </AppCard>
          </View>

          {historyItems.length > 0 && (
            <AppCard>
              <View style={styles.historyHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Historique</Text>
                <TouchableOpacity onPress={() => setHistorySortMode((m) => m === 'date' ? 'amount' : 'date')}>
                  <Text style={[styles.sortBtn, { color: theme.textMuted }]}>
                    {historySortMode === 'date' ? '📅' : '💰'}
                  </Text>
                </TouchableOpacity>
              </View>
              {historyItems.slice(0, 8).map((item) => (
                <HistoryItemRow
                  key={item.id}
                  item={item}
                  symbol={symbol}
                  onPress={() => loadHistory(item)}
                  onDelete={() => removeHistory(item.id)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              ))}
            </AppCard>
          )}

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
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 4 },
  headerIcon: { fontSize: 17 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 0 },
  summaryCard: { flex: 1, marginBottom: 8 },
  summaryLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  summaryValue: { fontSize: 20, fontWeight: '900' },
  detailBtn: { marginTop: 8, paddingVertical: 8, borderTopWidth: 1, alignItems: 'center' },
  detailBtnText: { fontSize: 13, fontWeight: '700' },
  controlsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  controlHalf: { flex: 1 },
  inputLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  inputDisplay: { fontSize: 22, fontWeight: '800' },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sortBtn: { fontSize: 16, padding: 2 },
  bottomPad: { height: 20 },
});
