import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../features/theme/ThemeProvider';
import { formatCurrency } from '../utils/format';

interface CustomKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onClear?: () => void;
  recentValues?: number[];
  onRecentSelect?: (value: number) => void;
  onQuickAdd?: (amount: number) => void;
  smicValue?: number | null;
  onSmicPress?: () => void;
  currencySymbol?: string;
  onCurrencyToggle?: (currency: string) => void;
  activeCurrency?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function KeyButton({
  label,
  onPress,
  wide,
  variant,
  theme,
}: {
  label: string;
  onPress: () => void;
  wide?: boolean;
  variant?: 'default' | 'accent' | 'danger';
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress, scale]);

  const bgColor =
    variant === 'accent' ? theme.primary :
    variant === 'danger' ? theme.danger + '30' :
    theme.surfaceLight;

  const textColor =
    variant === 'accent' ? '#FFFFFF' :
    variant === 'danger' ? theme.danger :
    theme.text;

  return (
    <AnimatedTouchable
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.key,
        { backgroundColor: bgColor },
        wide && styles.keyWide,
        animStyle,
      ]}
    >
      <Text style={[styles.keyText, { color: textColor }]}>{label}</Text>
    </AnimatedTouchable>
  );
}

export const CustomKeyboard = React.memo(function CustomKeyboard({
  onKeyPress,
  onDelete,
  onClear,
  recentValues = [],
  onRecentSelect,
  onQuickAdd,
  smicValue,
  onSmicPress,
  currencySymbol = '€',
  onCurrencyToggle,
  activeCurrency,
}: CustomKeyboardProps) {
  const { theme } = useTheme();

  const quickAmounts = useMemo(() => [
    { label: '+100', value: 100 },
    { label: '+500', value: 500 },
    { label: '+1000', value: 1000 },
    { label: '-100', value: -100 },
    { label: '-500', value: -500 },
  ], []);

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫'],
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      {recentValues.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsRow}
          contentContainerStyle={styles.suggestionsContent}
        >
          {recentValues.map((val, i) => (
            <TouchableOpacity
              key={`${val}-${i}`}
              style={[styles.suggestion, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onRecentSelect?.(val);
              }}
            >
              <Text style={[styles.suggestionText, { color: theme.primary }]}>
                {formatCurrency(val, currencySymbol)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickRow}
        contentContainerStyle={styles.quickContent}
      >
        {onCurrencyToggle && (
          <>
            {['€', '$', '£'].map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.quickBtn,
                  {
                    backgroundColor: currencySymbol === c ? theme.primary : theme.surfaceLight,
                    borderColor: currencySymbol === c ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onCurrencyToggle(c);
                }}
              >
                <Text style={[styles.quickBtnText, { color: currencySymbol === c ? '#FFF' : theme.text }]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.quickSeparator} />
          </>
        )}
        {quickAmounts.map((qa) => (
          <TouchableOpacity
            key={qa.label}
            style={[
              styles.quickBtn,
              {
                backgroundColor: qa.value > 0 ? theme.success + '15' : theme.danger + '15',
                borderColor: qa.value > 0 ? theme.success + '40' : theme.danger + '40',
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onQuickAdd?.(qa.value);
            }}
          >
            <Text
              style={[
                styles.quickBtnText,
                { color: qa.value > 0 ? theme.success : theme.danger },
              ]}
            >
              {qa.label}
            </Text>
          </TouchableOpacity>
        ))}
        {smicValue != null && smicValue > 0 && (
          <TouchableOpacity
            style={[styles.smicBtn, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              onSmicPress?.();
            }}
          >
            <Text style={[styles.smicBtnText, { color: theme.primary }]}>SMIC</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.keysGrid}>
        {keys.map((row, ri) => (
          <View key={ri} style={styles.keyRow}>
            {row.map((key) => (
              <KeyButton
                key={key}
                label={key}
                theme={theme}
                variant={key === '⌫' ? 'danger' : 'default'}
                onPress={() => {
                  if (key === '⌫') {
                    onDelete();
                  } else {
                    onKeyPress(key);
                  }
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingBottom: 20,
  },
  suggestionsRow: {
    maxHeight: 44,
    marginTop: 8,
  },
  suggestionsContent: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  suggestion: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickRow: {
    maxHeight: 44,
    marginTop: 8,
  },
  quickContent: {
    paddingHorizontal: 12,
    gap: 6,
    alignItems: 'center',
  },
  quickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickSeparator: {
    width: 1,
    height: 24,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  smicBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  smicBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  keysGrid: {
    marginTop: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  key: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  keyWide: {
    flex: 2,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '700',
  },
});
