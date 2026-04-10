import React, { useCallback } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../features/theme/ThemeProvider';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  symbol?: string;
  placeholder?: string;
}

export function AmountInput({
  value,
  onChangeText,
  label,
  symbol = '\u20ac',
  placeholder = '0.00',
}: AmountInputProps) {
  const { theme } = useTheme();

  const handleChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(/[^0-9.,]/g, '');
      onChangeText(cleaned);
    },
    [onChangeText]
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.surfaceLight, borderColor: theme.border },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.text }]}
        />
        <Text style={[styles.symbol, { color: theme.textSecondary }]}>
          {symbol}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: 14,
  },
  symbol: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
});
