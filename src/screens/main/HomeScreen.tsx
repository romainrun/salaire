import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../features/theme/ThemeProvider';
import { useSalaryStore } from '../../store/salaryStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { AppCard } from '../../components/AppCard';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ResultGrid } from '../../components/ResultGrid';
import { CustomKeyboard } from '../../components/CustomKeyboard';
import { getCountryByCode, getSmicForCountry } from '../../data';
import { formatCurrency, parseInputAmount } from '../../utils/format';
import { generateShareText } from '../../features/share/share';
import type { SalaryResults } from '../../types';

export function HomeScreen() {
  const { theme } = useTheme();
  const inputValue = useSalaryStore((s) => s.inputValue);
  const inputType = useSalaryStore((s) => s.inputType);
  const period = useSalaryStore((s) => s.period);
  const results = useSalaryStore((s) => s.results);
  const recentValues = useSalaryStore((s) => s.recentValues);
  const activeField = useSalaryStore((s) => s.activeField);
  const history = useSalaryStore((s) => s.history);
  const setInputValue = useSalaryStore((s) => s.setInputValue);
  const setInputType = useSalaryStore((s) => s.setInputType);
  const setPeriod = useSalaryStore((s) => s.setPeriod);
  const setActiveField = useSalaryStore((s) => s.setActiveField);
  const updateFromField = useSalaryStore((s) => s.updateFromField);
  const fillSmic = useSalaryStore((s) => s.fillSmic);
  const addQuickAmount = useSalaryStore((s) => s.addQuickAmount);
  const saveSimulation = useSalaryStore((s) => s.saveSimulation);
  const deleteHistoryItem = useSalaryStore((s) => s.deleteHistoryItem);
  const loadSimulation = useSalaryStore((s) => s.loadSimulation);
  const recalculate = useSalaryStore((s) => s.recalculate);
  const country = useOnboardingStore((s) => s.country);

  const countryData = getCountryByCode(country);
  const symbol = countryData?.currencySymbol ?? '€';
  const smicValue = getSmicForCountry(country);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [editingField, setEditingField] = useState<keyof SalaryResults | null>(null);
  const [editBuffer, setEditBuffer] = useState('');

  const openKeyboard = useCallback(() => {
    setKeyboardVisible(true);
  }, []);

  const closeKeyboard = useCallback(() => {
    setKeyboardVisible(false);
  }, []);

  const handleTypeChange = useCallback(
    (index: number) => {
      setInputType(index === 0 ? 'gross' : 'net');
    },
    [setInputType]
  );

  const handlePeriodChange = useCallback(
    (index: number) => {
      const periods = ['monthly', 'yearly', 'daily'] as const;
      setPeriod(periods[index]);
    },
    [setPeriod]
  );

  const handleKeyPress = useCallback(
    (key: string) => {
      if (editingField) {
        setEditBuffer((prev) => {
          if (key === '.' && prev.includes('.')) return prev;
          const newBuf = prev + key;
          const newVal = parseInputAmount(newBuf);
          updateFromField(editingField, newVal);
          return newBuf;
        });
      } else {
        setInputValue(inputValue + key);
      }
    },
    [inputValue, setInputValue, editingField, updateFromField]
  );

  const handleDelete = useCallback(() => {
    if (editingField) {
      setEditBuffer((prev) => {
        const newBuf = prev.slice(0, -1);
        const newVal = parseInputAmount(newBuf);
        updateFromField(editingField, newVal);
        return newBuf;
      });
    } else {
      setInputValue(inputValue.slice(0, -1));
    }
  }, [inputValue, setInputValue, editingField, updateFromField]);

  const handleFieldPress = useCallback(
    (field: keyof SalaryResults) => {
      setEditingField(field);
      setEditBuffer(results[field].toString());
      setActiveField(field);
      openKeyboard();
    },
    [results, setActiveField, openKeyboard]
  );

  const handleInputAreaPress = useCallback(() => {
    setEditingField(null);
    setEditBuffer('');
    setActiveField('input');
    openKeyboard();
  }, [setActiveField, openKeyboard]);

  const handleRecentSelect = useCallback(
    (val: number) => {
      setInputValue(val.toString());
      setEditingField(null);
      setActiveField('input');
    },
    [setInputValue, setActiveField]
  );

  const handleSmicPress = useCallback(() => {
    if (smicValue) {
      fillSmic(smicValue);
      setEditingField(null);
    }
  }, [smicValue, fillSmic]);

  const handleShare = async () => {
    const text = generateShareText(inputType, inputValue, results, symbol);
    try { await Share.share({ message: text }); } catch (_) {}
  };

  const handleAutoSave = useCallback(() => {
    const val = parseInputAmount(inputValue);
    if (val > 0) {
      saveSimulation('');
    }
  }, [inputValue, saveSimulation]);

  const periodIndex = period === 'monthly' ? 0 : period === 'yearly' ? 1 : 2;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.appTitle, { color: theme.text }]}>Salaire</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {countryData?.flag} {countryData?.name}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={recalculate} style={styles.headerBtn}>
                <Text style={{ fontSize: 20 }}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
                <Text style={{ fontSize: 20 }}>📤</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAutoSave} style={styles.headerBtn}>
                <Text style={{ fontSize: 20 }}>💾</Text>
              </TouchableOpacity>
            </View>
          </View>

          <AppCard>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Votre salaire réel</Text>
            <Text style={[styles.netHighlight, { color: theme.primary }]}>
              {formatCurrency(results.netMonthly, symbol)}
            </Text>
            <Text style={[styles.cardSubLabel, { color: theme.textMuted }]}>net mensuel</Text>
          </AppCard>

          <SegmentedControl
            values={['Brut', 'Net']}
            selectedIndex={inputType === 'gross' ? 0 : 1}
            onChange={handleTypeChange}
          />
          <View style={styles.spacer} />
          <SegmentedControl
            values={['Mensuel', 'Annuel', 'Journalier']}
            selectedIndex={periodIndex}
            onChange={handlePeriodChange}
          />
          <View style={styles.spacer} />

          <TouchableOpacity onPress={handleInputAreaPress} activeOpacity={0.9}>
            <AppCard style={activeField === 'input' ? { borderColor: theme.primary, borderWidth: 2 } : undefined}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                {inputType === 'gross' ? 'Brut' : 'Net'} {period === 'monthly' ? 'mensuel' : period === 'yearly' ? 'annuel' : 'journalier'}
              </Text>
              <Text style={[styles.inputDisplay, { color: theme.text }]}>
                {inputValue || '0'} {symbol}
              </Text>
            </AppCard>
          </TouchableOpacity>

          <AppCard>
            <ResultGrid
              results={results}
              symbol={symbol}
              activeField={activeField}
              onFieldPress={handleFieldPress}
            />
          </AppCard>

          {history.length > 0 && (
            <AppCard>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Historique</Text>
              {history.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => loadSimulation(item)}
                  onLongPress={() => deleteHistoryItem(item.id)}
                  style={[styles.historyItem, { borderBottomColor: theme.border }]}
                >
                  <View>
                    <Text style={[styles.historyTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.historyDate, { color: theme.textMuted }]}>
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <Text style={[styles.historyValue, { color: theme.primary }]}>
                    {formatCurrency(item.results.netMonthly, symbol)}
                  </Text>
                </TouchableOpacity>
              ))}
            </AppCard>
          )}

          <View style={styles.bottomPadding} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  appTitle: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerBtn: { padding: 8 },
  cardLabel: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  netHighlight: { fontSize: 36, fontWeight: '900' },
  cardSubLabel: { fontSize: 12, marginTop: 2 },
  spacer: { height: 12 },
  inputLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  inputDisplay: { fontSize: 28, fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  historyItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1,
  },
  historyTitle: { fontSize: 14, fontWeight: '600' },
  historyDate: { fontSize: 12, marginTop: 2 },
  historyValue: { fontSize: 16, fontWeight: '700' },
  bottomPadding: { height: 40 },
});
