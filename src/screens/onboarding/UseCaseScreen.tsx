import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useTheme } from '../../features/theme/ThemeProvider';
import { GradientButton } from '../../components/GradientButton';
import type { UseCase } from '../../types';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList, 'UseCase'>;

const options: { value: UseCase; icon: string; title: string; desc: string }[] = [
  { value: 'convert', icon: '🔄', title: 'Convertir mon salaire', desc: 'Calculer brut ↔ net en temps réel' },
  { value: 'target', icon: '🎯', title: 'Salaire cible', desc: 'Définir un objectif et simuler' },
];

export function UseCaseScreen() {
  const navigation = useNavigation<NavProp>();
  const { theme } = useTheme();
  const useCase = useOnboardingStore((s) => s.useCase);
  const setUseCase = useOnboardingStore((s) => s.setUseCase);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.step, { color: theme.textSecondary }]}>Étape 2/4</Text>
          <TouchableOpacity onPress={completeOnboarding}>
            <Text style={[styles.skipBtn, { color: theme.textMuted }]}>Passer</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Que souhaitez-vous faire ?</Text>
      </View>

      <View style={styles.options}>
        {options.map((opt) => {
          const active = useCase === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionCard,
                {
                  backgroundColor: active ? theme.primary + '15' : theme.surface,
                  borderColor: active ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setUseCase(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.optIcon}>{opt.icon}</Text>
              <Text style={[styles.optTitle, { color: theme.text }]}>{opt.title}</Text>
              <Text style={[styles.optDesc, { color: theme.textSecondary }]}>{opt.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <GradientButton title="Continuer" onPress={() => navigation.navigate('TaxConfig')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  step: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  skipBtn: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800' },
  options: { flex: 1, justifyContent: 'center', gap: 16 },
  optionCard: { padding: 24, borderRadius: 20, borderWidth: 1.5, alignItems: 'center' },
  optIcon: { fontSize: 40, marginBottom: 12 },
  optTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  optDesc: { fontSize: 14, textAlign: 'center' },
  footer: { marginTop: 20 },
});
