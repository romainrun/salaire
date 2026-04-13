import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useTheme } from '../../features/theme/ThemeProvider';
import { useUIStore } from '../../store/uiStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useSalaryStore } from '../../store/salaryStore';
import { usePremiumStore } from '../../store/premiumStore';
import { AppCard } from '../../components/AppCard';
import { AppSwitchRow } from '../../components/AppSwitchRow';
import { SegmentedControl } from '../../components/SegmentedControl';
import { GradientButton } from '../../components/GradientButton';
import { countries } from '../../data';
import { APP_NAME, APP_TAGLINE, LABELS } from '../../constants/appName';
import type { ThemeMode, Country } from '../../types';
import { useRewardedAd } from '../../features/ads/useRewardedAd';
import { useFeatureGate } from '../../features/premium/useFeatureGate';
import { AdUnlockModal } from '../../features/unlock/AdUnlockModal';
import { analyticsService } from '../../features/analytics/analyticsService';
import { ADS_DISABLED_OVERRIDE, FORCE_TOP_BANNER_AB_IN_PROD } from '../../config/runtimeFlags';

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
      <AppCard>{children}</AppCard>
    </View>
  );
}

export function SettingsScreen() {
  const { theme } = useTheme();
  const uiTheme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const notificationsEnabled = useUIStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useUIStore((s) => s.setNotificationsEnabled);
  const ratePromptSeen = useUIStore((s) => s.ratePromptSeen);
  const setRatePromptSeen = useUIStore((s) => s.setRatePromptSeen);
  const showTopHomeBanner = useUIStore((s) => s.showTopHomeBanner);
  const setShowTopHomeBanner = useUIStore((s) => s.setShowTopHomeBanner);
  const displayCurrency = useSalaryStore((s) => s.displayCurrency);
  const setDisplayCurrency = useSalaryStore((s) => s.setDisplayCurrency);

  const onboarding = useOnboardingStore();
  const clearHistory = useSalaryStore((s) => s.clearHistory);
  const resetSalaryData = useSalaryStore((s) => s.reset);
  const resetUnlocks = usePremiumStore((s) => s.resetUnlocks);

  const { unlockAdFree, unlockFeature } = useRewardedAd();
  const advancedGate = useFeatureGate('advancedOptions');
  const salaryMode = useSalaryStore((s) => s.mode);
  const setSalaryMode = useSalaryStore((s) => s.setMode);
  const [unlockAdvancedVisible, setUnlockAdvancedVisible] = useState(false);

  const themeOptions: ThemeMode[] = ['dark', 'light', 'system'];
  const themeLabels = ['Sombre', 'Clair', 'Système'];
  const themeIndex = themeOptions.indexOf(uiTheme);

  const handleThemeChange = (index: number) => setTheme(themeOptions[index]);
  const handleTopBannerToggle = (value: boolean) => {
    if (FORCE_TOP_BANNER_AB_IN_PROD) {
      return;
    }
    setShowTopHomeBanner(value);
    analyticsService.trackEvent('top_banner_toggle', { enabled: value });
  };
  const handleCurrencyChange = (index: number) => {
    const next = (['EUR', 'USD', 'GBP'] as const)[index];
    setDisplayCurrency(next);
    analyticsService.trackEvent('currency_changed', { currency: next });
  };
  const handleCountrySelect = (c: Country) => onboarding.setCountry(c.code, c.currency);
  const handleCountrySelection = (c: Country) => {
    handleCountrySelect(c);
    analyticsService.trackEvent('country_changed', { country_code: c.code });
  };

  const handleClearHistory = () => {
    Alert.alert('Effacer l\'historique', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Effacer', style: 'destructive', onPress: clearHistory },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Réinitialiser', 'Toutes les données seront effacées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Réinitialiser',
        style: 'destructive',
        onPress: () => {
          resetSalaryData();
          resetUnlocks();
          onboarding.resetOnboarding();
        },
      },
    ]);
  };

  const handleRemoveAdsFor30Min = () => {
    void unlockAdFree();
    analyticsService.trackEvent('unlock_adfree_requested', { source: 'settings' });
  };

  const handleAdvancedModeChange = (enabled: boolean) => {
    if (enabled && !advancedGate.allowed) {
      setUnlockAdvancedVisible(true);
      analyticsService.trackEvent('feature_locked_tapped', {
        feature: 'advanced_options',
        source: 'settings_toggle',
      });
      return;
    }
    setSalaryMode(enabled ? 'advanced' : 'simple');
    analyticsService.trackEvent('mode_changed', { mode: enabled ? 'advanced' : 'simple' });
  };

  const handleRate = () => {
    setRatePromptSeen(true);
    Alert.alert('Merci !', 'Merci de votre soutien ❤️');
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>{LABELS.settings}</Text>

        <SettingsSection title="Notifications">
          <AppSwitchRow
            label="Notifications"
            description="Recevoir des rappels"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </SettingsSection>

        <SettingsSection title="Pays">
          <View style={styles.countryGrid}>
            {countries.slice(0, 8).map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[
                  styles.countryChip,
                  {
                    backgroundColor: c.code === onboarding.country ? theme.primary + '20' : theme.surfaceLight,
                    borderColor: c.code === onboarding.country ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => handleCountrySelection(c)}
              >
                <Text style={styles.countryChipFlag}>{c.flag}</Text>
                <Text style={[styles.countryChipText, { color: theme.text }]} numberOfLines={1}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingsSection>

        <SettingsSection title="Thème">
          <SegmentedControl values={themeLabels} selectedIndex={themeIndex >= 0 ? themeIndex : 0} onChange={handleThemeChange} />
        </SettingsSection>

        <SettingsSection title="Affichage devise">
          <SegmentedControl
            values={['EUR', 'USD', 'GBP']}
            selectedIndex={Math.max(0, (['EUR', 'USD', 'GBP'] as const).indexOf(displayCurrency as 'EUR' | 'USD' | 'GBP'))}
            onChange={handleCurrencyChange}
          />
        </SettingsSection>

        <SettingsSection title="Publicité">
          <View style={styles.buttonGroup}>
            <GradientButton title="Supprimer les pubs (30 min)" onPress={handleRemoveAdsFor30Min} compact />
            <GradientButton title="Regarder une publicité" onPress={handleRemoveAdsFor30Min} variant="secondary" compact />
          </View>
        </SettingsSection>

        <SettingsSection title="Monétisation">
          <AppSwitchRow
            label="Banner haut (A/B)"
            description={
              FORCE_TOP_BANNER_AB_IN_PROD
                ? 'Actif en production (forcé)'
                : 'Activer un second banner sur l\'écran principal'
            }
            value={showTopHomeBanner}
            onValueChange={handleTopBannerToggle}
          />
          {ADS_DISABLED_OVERRIDE ? (
            <Text style={[styles.overrideHint, { color: theme.warning }]}>
              Mode test activé: pubs désactivées et fonctionnalités débloquées.
            </Text>
          ) : null}
          <View style={styles.buttonGroup}>
            <AppSwitchRow
              label="Mode avancé"
              description="Débloquer avec une publicité"
              value={salaryMode === 'advanced'}
              onValueChange={handleAdvancedModeChange}
            />
            <GradientButton
              title={advancedGate.allowed ? 'Mode avancé débloqué' : 'Débloquer avec une pub'}
              onPress={() => setUnlockAdvancedVisible(true)}
              compact
              variant="secondary"
            />
          </View>
        </SettingsSection>

        <SettingsSection title="Données">
          <View style={styles.buttonGroup}>
            <GradientButton title="Effacer l'historique" onPress={handleClearHistory} variant="danger" compact />
            <GradientButton title="Réinitialiser l'app" onPress={handleReset} variant="danger" compact />
          </View>
        </SettingsSection>

        <SettingsSection title="Informations">
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Version</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{appVersion}</Text>
          </View>
          <TouchableOpacity onPress={handleRate} style={styles.rateBtn}>
            <Text style={[styles.rateText, { color: theme.primary }]}>
              {ratePromptSeen ? 'Merci ❤️' : '⭐ Noter l\'application'}
            </Text>
          </TouchableOpacity>
        </SettingsSection>

        <View style={styles.footer}>
          <Text style={[styles.footerName, { color: theme.textMuted }]}>{APP_NAME}</Text>
          <Text style={[styles.footerTagline, { color: theme.textMuted }]}>{APP_TAGLINE}</Text>
        </View>
      </ScrollView>

      <AdUnlockModal
        visible={unlockAdvancedVisible}
        onClose={() => setUnlockAdvancedVisible(false)}
        onWatchAd={async () => {
          const result = await unlockFeature('advancedOptions');
          if (result === 'rewarded') {
            setUnlockAdvancedVisible(false);
            setSalaryMode('advanced');
          }
        }}
        onAdFree={async () => {
          const result = await unlockAdFree();
          if (result === 'rewarded') {
            setUnlockAdvancedVisible(false);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  countryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  countryChipFlag: { fontSize: 18, marginRight: 6 },
  countryChipText: { fontSize: 13, fontWeight: '600' },
  buttonGroup: { gap: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
  infoLabel: { fontSize: 15 },
  infoValue: { fontSize: 15, fontWeight: '600' },
  rateBtn: { paddingVertical: 14, alignItems: 'center' },
  rateText: { fontSize: 16, fontWeight: '700' },
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerName: { fontSize: 14, fontWeight: '700' },
  footerTagline: { fontSize: 11, marginTop: 2 },
  overrideHint: { fontSize: 12, fontWeight: '600', marginTop: 8 },
});
