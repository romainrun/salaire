import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  BackHandler,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../features/theme/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
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
import { useHistory, type SortMode } from '../../features/history/useHistory';
import { APP_NAME, LABELS } from '../../constants/appName';
import type { SalaryResults } from '../../types';
import { AdBanner } from '../../components/AdBanner';
import { AdUnlockModal } from '../../features/unlock/AdUnlockModal';
import { useInterstitialAd } from '../../features/ads/useInterstitialAd';
import { useRewardedAd } from '../../features/ads/useRewardedAd';
import { useUIStore } from '../../store/uiStore';
import { usePremiumStore } from '../../store/premiumStore';
import { getFeatureGate } from '../../features/premium/useFeatureGate';
import { analyticsService } from '../../features/analytics/analyticsService';
import type { MainTabParamList } from '../../navigation/types';

const KEYBOARD_VISIBLE_MARGIN = 20;

export function HomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
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
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(380);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [breakdownVisible, setBreakdownVisible] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [editingField, setEditingField] = useState<keyof SalaryResults | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [historySortMode, setHistorySortMode] = useState<SortMode>('date');
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState<'history' | 'adFree'>('adFree');
  const [hasTriggeredFirstValueAd, setHasTriggeredFirstValueAd] = useState(false);

  const {
    items: historyItems,
    remove: removeHistory,
    load: loadHistory,
    toggleFavorite,
  } = useHistory(historySortMode);
  const setIsUserTyping = useUIStore((s) => s.setIsUserTyping);
  const isHistoryRewardedUnlocked = usePremiumStore((s) => s.isFeatureUnlocked('history'));
  const { tryShowFirstValueInterstitial, tryShowContextualInterstitial, trackActionAndMaybeShowInterstitial } =
    useInterstitialAd();
  const { unlockFeature, unlockAdFree } = useRewardedAd();

  useEffect(() => {
    setIsUserTyping(keyboardVisible);
  }, [keyboardVisible, setIsUserTyping]);

  const openKeyboard = useCallback(() => setKeyboardVisible(true), []);
  const closeKeyboard = useCallback(() => setKeyboardVisible(false), []);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (quickMode) {
        setQuickMode(false);
        return true;
      }
      if (breakdownVisible) {
        setBreakdownVisible(false);
        return true;
      }
      if (keyboardVisible) {
        setKeyboardVisible(false);
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [keyboardVisible, breakdownVisible, quickMode]);

  const handleScrollLayout = useCallback((event: LayoutChangeEvent) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  }, []);

  const scrollToFocused = useCallback((y: number) => {
    setTimeout(() => {
      const effectiveHeight = Math.max(1, scrollViewHeight - keyboardHeight);
      const targetY = Math.max(0, y - effectiveHeight + KEYBOARD_VISIBLE_MARGIN);
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }, 100);
  }, [keyboardHeight, scrollViewHeight]);

  useEffect(() => {
    if (!keyboardVisible) return;
    if (activeField === 'input') {
      scrollToFocused(inputYRef.current);
      return;
    }
    scrollToFocused(gridYRef.current);
  }, [activeField, keyboardVisible, scrollToFocused]);

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
      return;
    }
    setInputValue(inputValue + key);
  }, [editingField, inputValue, setInputValue, updateFromField]);

  const handleDelete = useCallback(() => {
    if (editingField) {
      setEditBuffer((prev) => {
        const newBuf = prev.slice(0, -1);
        updateFromField(editingField, parseSalaryInput(newBuf));
        return newBuf;
      });
      return;
    }
    setInputValue(inputValue.slice(0, -1));
  }, [editingField, inputValue, setInputValue, updateFromField]);

  const handleFieldPress = useCallback((field: keyof SalaryResults) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingField(field);
    setEditBuffer('');
    updateFromField(field, 0);
    setActiveField(field);
    openKeyboard();
    scrollToFocused(gridYRef.current);
  }, [openKeyboard, scrollToFocused, setActiveField, updateFromField]);

  const handleInputAreaPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingField(null);
    setEditBuffer('');
    setInputValue('');
    setActiveField('input');
    openKeyboard();
    scrollToFocused(inputYRef.current);
  }, [openKeyboard, scrollToFocused, setActiveField, setInputValue]);

  const handleRecentSelect = useCallback((val: number) => {
    setInputValue(val.toString());
    setEditingField(null);
    setActiveField('input');
  }, [setActiveField, setInputValue]);

  const handleSmicPress = useCallback(() => {
    if (smicValue) {
      fillSmic(smicValue);
      setEditingField(null);
    }
  }, [smicValue, fillSmic]);

  const shareText = formatShareText({
    inputType,
    inputValue,
    results,
    symbol,
    countryName: countryData?.name,
    countryFlag: countryData?.flag,
  });

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({ message: shareText });
      analyticsService.trackEvent('share_from_home', {
        has_result: results.grossMonthly > 0,
        input_type: inputType,
        period,
      });
    } catch (_) {}
    void tryShowContextualInterstitial('home_share');
  };

  const historyGate = getFeatureGate('history');
  const visibleHistoryItems = useMemo(
    () => historyItems.slice(0, isHistoryRewardedUnlocked ? 8 : 1),
    [historyItems, isHistoryRewardedUnlocked]
  );

  const openUnlockModal = useCallback((target: 'history' | 'adFree') => {
    setUnlockTarget(target);
    setUnlockModalVisible(true);
  }, []);

  const handleAutoSave = useCallback(() => {
    if (parseSalaryInput(inputValue) <= 0) return;
    const gate = getFeatureGate('history');
    if (!gate.allowed) {
      analyticsService.trackEvent('history_save_blocked', {
        reason: 'history_limit',
        visible_history_count: visibleHistoryItems.length,
      });
      openUnlockModal('history');
      return;
    }
    saveSimulation('');
    analyticsService.trackEvent('history_save_success', {
      history_count: historyItems.length + 1,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    void trackActionAndMaybeShowInterstitial('home_autosave');
  }, [
    historyItems.length,
    inputValue,
    openUnlockModal,
    saveSimulation,
    trackActionAndMaybeShowInterstitial,
    visibleHistoryItems.length,
  ]);

  useEffect(() => {
    if (results.grossMonthly <= 0) return;
    if (hasTriggeredFirstValueAd) return;
    setHasTriggeredFirstValueAd(true);
    void tryShowFirstValueInterstitial('home_first_result');
  }, [hasTriggeredFirstValueAd, results.grossMonthly, tryShowFirstValueInterstitial]);

  const handleWatchUnlock = useCallback(async () => {
    const result = unlockTarget === 'adFree' ? await unlockAdFree() : await unlockFeature(unlockTarget);
    if (result === 'rewarded') {
      setUnlockModalVisible(false);
    }
  }, [unlockAdFree, unlockFeature, unlockTarget]);

  const handleUnlockAdFree = useCallback(async () => {
    const result = await unlockAdFree();
    if (result === 'rewarded') {
      setUnlockModalVisible(false);
    }
  }, [unlockAdFree]);

  const periodIndex = period === 'monthly' ? 0 : period === 'yearly' ? 1 : 2;

  if (quickMode) {
    return <QuickModeScreen onClose={() => setQuickMode(false)} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.flex}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: keyboardVisible ? keyboardHeight + 12 : 6 }]}
          onLayout={handleScrollLayout}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={[styles.appTitle, { color: theme.text }]}>{APP_NAME}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                activeOpacity={0.8}
                style={styles.flagButton}
              >
                <Text style={styles.flag}>{countryData?.flag}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.headerActions}>
              <PressableScale
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setQuickMode(true);
                }}
              >
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
              <PressableScale onPress={() => openUnlockModal('adFree')}>
                <Text style={styles.headerIcon}>💎</Text>
              </PressableScale>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <AppCard style={styles.summaryCard}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{LABELS.grossMonthly}</Text>
                <AnimatedNumber
                  value={results.grossMonthly}
                  symbol={symbol}
                  style={[styles.summaryValue, { color: theme.text }]}
                />
              </AppCard>
            </View>
            <View style={styles.summaryCol}>
              <AppCard style={styles.summaryCard}>
                <Text style={[styles.summaryLabel, { color: theme.primary }]}>{LABELS.netMonthly}</Text>
                <AnimatedNumber
                  value={results.netMonthly}
                  symbol={symbol}
                  style={[styles.summaryValue, { color: theme.primary }]}
                />
              </AppCard>
            </View>
          </View>

          {results.grossMonthly > 0 && (
            <AppCard>
              <SalaryChart gross={results.grossMonthly} net={results.netMonthly} symbol={symbol} />
              <PressableScale
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBreakdownVisible(true);
                }}
              >
                <View style={[styles.detailBtn, { borderColor: theme.border }]}>
                  <Text style={[styles.detailBtnText, { color: theme.primary }]}>{LABELS.details}</Text>
                </View>
              </PressableScale>
            </AppCard>
          )}

          <View style={styles.controlsRow}>
            <SegmentedControl
              values={[LABELS.gross, LABELS.net]}
              selectedIndex={inputType === 'gross' ? 0 : 1}
              onChange={handleTypeChange}
            />
          </View>
          <View style={styles.controlsRow}>
            <SegmentedControl
              values={[LABELS.monthly, LABELS.yearly, LABELS.daily]}
              selectedIndex={periodIndex}
              onChange={handlePeriodChange}
            />
          </View>

          <View
            onLayout={(e) => {
              inputYRef.current = e.nativeEvent.layout.y;
            }}
          >
            <TouchableOpacity onPress={handleInputAreaPress} activeOpacity={0.9}>
              <EditableFieldWrapper isActive={activeField === 'input'}>
                <View style={styles.inputInner}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    {`Objectif ${inputType === 'gross' ? 'brut' : 'net'} ${
                      period === 'monthly' ? 'mensuel' : period === 'yearly' ? 'annuel' : 'journalier'
                    }`}
                  </Text>
                  <Text style={[styles.inputDisplay, { color: theme.text }]}>
                    {inputValue || '0'} {symbol}
                  </Text>
                </View>
              </EditableFieldWrapper>
            </TouchableOpacity>
          </View>

          <View style={{ height: 8 }} />

          <View
            onLayout={(e) => {
              gridYRef.current = e.nativeEvent.layout.y;
            }}
          >
            <AppCard>
              <ResultGrid results={results} symbol={symbol} activeField={activeField} onFieldPress={handleFieldPress} />
            </AppCard>
          </View>

          <AppCard>
            <View style={styles.historyHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{LABELS.history}</Text>
              {historyItems.length > 0 && (
                <PressableScale onPress={() => setHistorySortMode((m) => (m === 'date' ? 'amount' : 'date'))}>
                  <Text style={[styles.sortBtn, { color: theme.textMuted }]}>
                    {historySortMode === 'date' ? '📅' : '💰'}
                  </Text>
                </PressableScale>
              )}
            </View>
            {historyItems.length === 0 ? (
              <EmptyState icon="📋" title={LABELS.emptyHistory} message={LABELS.emptyHistoryMsg} />
            ) : (
              visibleHistoryItems.map((item) => (
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
            {!historyGate.allowed ? (
              <Text style={[styles.lockHint, { color: theme.warning }]}>
                Limite atteinte (1 simulation). Débloquer avec une publicité.
              </Text>
            ) : null}
          </AppCard>

          <View style={styles.bottomPad} />
        </ScrollView>

        <CustomKeyboard
          visible={keyboardVisible}
          onClose={closeKeyboard}
          onSubmit={closeKeyboard}
          onHeightChange={setKeyboardHeight}
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          recentValues={recentValues}
          onRecentSelect={handleRecentSelect}
          onQuickAdd={addQuickAmount}
          smicValue={smicValue}
          onSmicPress={handleSmicPress}
          currencySymbol={symbol}
        />
        <AdBanner topSpacing={6} />
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
      <AdUnlockModal
        visible={unlockModalVisible}
        onClose={() => setUnlockModalVisible(false)}
        onWatchAd={handleWatchUnlock}
        onAdFree={handleUnlockAdFree}
        title={unlockTarget === 'adFree' ? 'Supprimer les pubs 30 min' : 'Débloquer cette fonctionnalité'}
        description={
          unlockTarget === 'adFree'
            ? 'Regardez une courte publicité pour supprimer les pubs pendant 30 minutes.'
            : 'Regardez une courte publicité pour continuer.'
        }
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
  flagButton: { paddingHorizontal: 2, paddingVertical: 2 },
  flag: { fontSize: 18 },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  quickBtn: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  quickBtnText: { fontSize: 16 },
  headerIcon: { fontSize: 17, padding: 4 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 0, width: '100%' },
  summaryCol: { flex: 1 },
  summaryCard: { marginBottom: 8 },
  summaryLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  summaryValue: { fontSize: 20, fontWeight: '900' },
  detailBtn: { marginTop: 8, paddingVertical: 8, borderTopWidth: 1, alignItems: 'center' },
  detailBtnText: { fontSize: 13, fontWeight: '700' },
  lockHint: { fontSize: 12, marginTop: 8, fontWeight: '600' },
  controlsRow: { width: '100%', marginBottom: 8 },
  inputInner: { padding: 12 },
  inputLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  inputDisplay: { fontSize: 22, fontWeight: '800' },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sortBtn: { fontSize: 16, padding: 2 },
  bottomPad: { height: 20 },
});
