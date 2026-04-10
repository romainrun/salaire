import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../features/theme/ThemeProvider';
import { useSalaryStore } from '../../store/salaryStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { usePremiumStore } from '../../store/premiumStore';
import { AppCard } from '../../components/AppCard';
import { AmountInput } from '../../components/AmountInput';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ResultGrid } from '../../components/ResultGrid';
import { GradientButton } from '../../components/GradientButton';
import { EmptyState } from '../../components/EmptyState';
import { getCountryByCode, getCurrencySymbol } from '../../data';
import { formatCurrency } from '../../utils/format';
import type { SalaryInputType } from '../../types';
import { generateShareText } from '../../features/share/share';

export function HomeScreen() {
  const { theme } = useTheme();
  const inputValue = useSalaryStore((s) => s.inputValue);
  const inputType = useSalaryStore((s) => s.inputType);
  const results = useSalaryStore((s) => s.results);
  const mode = useSalaryStore((s) => s.mode);
  const history = useSalaryStore((s) => s.history);
  const setInputValue = useSalaryStore((s) => s.setInputValue);
  const setInputType = useSalaryStore((s) => s.setInputType);
  const setMode = useSalaryStore((s) => s.setMode);
  const saveSimulation = useSalaryStore((s) => s.saveSimulation);
  const recalculate = useSalaryStore((s) => s.recalculate);
  const country = useOnboardingStore((s) => s.country);
  const currency = useOnboardingStore((s) => s.currency);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const adsUnlocked = usePremiumStore((s) => s.adsUnlocked);

  const [saveTitle, setSaveTitle] = useState('');

  const countryData = getCountryByCode(country);
  const symbol = getCurrencySymbol(currency);
  const canUseAdvanced = isPremium || adsUnlocked;

  const handleTypeChange = useCallback(
    (index: number) => {
      setInputType(index === 0 ? 'gross' : 'net');
    },
    [setInputType]
  );

  const handleModeChange = useCallback(
    (index: number) => {
      if (index === 1 && !canUseAdvanced) {
        Alert.alert('Premium requis', 'D\u00e9bloquez le mode avanc\u00e9 avec Premium.');
        return;
      }
      setMode(index === 0 ? 'simple' : 'advanced');
    },
    [setMode, canUseAdvanced]
  );

  const handleSave = () => {
    const title = saveTitle.trim() || `Simulation du ${new Date().toLocaleDateString('fr-FR')}`;
    saveSimulation(title);
    setSaveTitle('');
    Alert.alert('Sauvegard\u00e9', 'Simulation enregistr\u00e9e dans l\u2019historique.');
  };

  const handleShare = async () => {
    const text = generateShareText(inputType, inputValue, results, symbol);
    try {
      await Share.share({ message: text });
    } catch (_) {}
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
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
              <Text style={{ fontSize: 20 }}>{'\ud83d\udd04'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
              <Text style={{ fontSize: 20 }}>{'\ud83d\udce4'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <AppCard>
          <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
            Votre salaire r\u00e9el
          </Text>
          <Text style={[styles.netHighlight, { color: theme.primary }]}>
            {formatCurrency(results.netMonthly, symbol)}
          </Text>
          <Text style={[styles.cardSubLabel, { color: theme.textMuted }]}>
            net mensuel
          </Text>
        </AppCard>

        <SegmentedControl
          values={['Simple', 'Avanc\u00e9']}
          selectedIndex={mode === 'simple' ? 0 : 1}
          onChange={handleModeChange}
        />

        <View style={styles.spacer} />

        <SegmentedControl
          values={['Brut', 'Net']}
          selectedIndex={inputType === 'gross' ? 0 : 1}
          onChange={handleTypeChange}
        />

        <View style={styles.spacer} />

        <AmountInput
          value={inputValue}
          onChangeText={setInputValue}
          label={inputType === 'gross' ? 'Salaire brut mensuel' : 'Salaire net mensuel'}
          symbol={symbol}
        />

        <AppCard>
          <ResultGrid results={results} symbol={symbol} />
        </AppCard>

        <AppCard>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Sauvegarder
          </Text>
          <AmountInput
            value={saveTitle}
            onChangeText={setSaveTitle}
            label="Titre (optionnel)"
            symbol=""
            placeholder="Ma simulation..."
          />
          <GradientButton title="Enregistrer" onPress={handleSave} compact />
        </AppCard>

        {history.length > 0 && (
          <AppCard>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Historique
            </Text>
            {history.slice(0, 5).map((item) => (
              <View
                key={item.id}
                style={[styles.historyItem, { borderBottomColor: theme.border }]}
              >
                <View>
                  <Text style={[styles.historyTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.historyDate, { color: theme.textMuted }]}>
                    {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <Text style={[styles.historyValue, { color: theme.primary }]}>
                  {formatCurrency(item.results.netMonthly, symbol)}
                </Text>
              </View>
            ))}
          </AppCard>
        )}

        {history.length === 0 && (
          <EmptyState
            title="Aucune simulation"
            message="Saisissez un montant et enregistrez votre premi\u00e8re simulation."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    padding: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  netHighlight: {
    fontSize: 36,
    fontWeight: '900',
  },
  cardSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  spacer: {
    height: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 12,
    marginTop: 2,
  },
  historyValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
