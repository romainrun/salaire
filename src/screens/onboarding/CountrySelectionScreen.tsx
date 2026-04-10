import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useTheme } from '../../features/theme/ThemeProvider';
import { GradientButton } from '../../components/GradientButton';
import { countries } from '../../data';
import type { Country } from '../../types';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList, 'CountrySelection'>;

export function CountrySelectionScreen() {
  const navigation = useNavigation<NavProp>();
  const { theme } = useTheme();
  const selectedCountry = useOnboardingStore((s) => s.country);
  const setCountry = useOnboardingStore((s) => s.setCountry);
  const setMissingCountryMessage = useOnboardingStore((s) => s.setMissingCountryMessage);

  const [search, setSearch] = useState('');
  const [missingText, setMissingText] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelect = useCallback(
    (country: Country) => {
      setCountry(country.code, country.currency);
    },
    [setCountry]
  );

  const handleNext = () => {
    if (missingText.trim()) {
      setMissingCountryMessage(missingText.trim());
    }
    navigation.navigate('UseCase');
  };

  const renderItem = useCallback(
    ({ item }: { item: Country }) => {
      const active = item.code === selectedCountry;
      return (
        <TouchableOpacity
          style={[
            styles.countryItem,
            {
              backgroundColor: active ? theme.primary + '20' : theme.surface,
              borderColor: active ? theme.primary : theme.border,
            },
          ]}
          onPress={() => handleSelect(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.flag}>{item.flag}</Text>
          <View style={styles.countryInfo}>
            <Text style={[styles.countryName, { color: theme.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.countryMeta, { color: theme.textSecondary }]}>
              {item.currency} \u00b7 {(item.taxRate * 100).toFixed(0)}% charges
            </Text>
          </View>
          {active && (
            <Text style={[styles.check, { color: theme.primary }]}>\u2713</Text>
          )}
        </TouchableOpacity>
      );
    },
    [selectedCountry, theme, handleSelect]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.step, { color: theme.textSecondary }]}>
          \u00c9tape 1/4
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>
          S\u00e9lectionnez votre pays
        </Text>
      </View>

      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: theme.surfaceLight,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        placeholder="Rechercher un pays..."
        placeholderTextColor={theme.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.missingSection}>
        <TextInput
          style={[
            styles.missingInput,
            {
              backgroundColor: theme.surfaceLight,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Pays manquant ? Dites-le nous..."
          placeholderTextColor={theme.textMuted}
          value={missingText}
          onChangeText={setMissingText}
        />
      </View>

      <GradientButton title="Continuer" onPress={handleNext} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  step: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  list: {
    paddingBottom: 12,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  flag: {
    fontSize: 28,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  countryMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  check: {
    fontSize: 20,
    fontWeight: '700',
  },
  missingSection: {
    marginBottom: 16,
  },
  missingInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
});
