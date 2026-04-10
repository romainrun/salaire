import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../features/theme/ThemeProvider';
import { formatCurrency } from '../utils/format';

const KEYBOARD_HEIGHT = 340;
const ANIMATION_DURATION = 250;

interface CustomKeyboardProps {
  visible: boolean;
  onClose: () => void;
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  recentValues?: number[];
  onRecentSelect?: (value: number) => void;
  onQuickAdd?: (amount: number) => void;
  smicValue?: number | null;
  onSmicPress?: () => void;
  currencySymbol?: string;
  onCurrencyToggle?: (currency: string) => void;
}

function KeyButton({
  label,
  onPress,
  variant,
  theme,
}: {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const bgColor = variant === 'danger' ? theme.danger + '30' : theme.surfaceLight;
  const textColor = variant === 'danger' ? theme.danger : theme.text;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      style={[styles.key, { backgroundColor: bgColor }]}
    >
      <Text style={[styles.keyText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export const CustomKeyboard = React.memo(function CustomKeyboard({
  visible,
  onClose,
  onKeyPress,
  onDelete,
  recentValues = [],
  onRecentSelect,
  onQuickAdd,
  smicValue,
  onSmicPress,
  currencySymbol = '€',
  onCurrencyToggle,
}: CustomKeyboardProps) {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(visible ? 0 : KEYBOARD_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: KEYBOARD_HEIGHT,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

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
    <>
      {visible && (
        <Animated.View
          pointerEvents="auto"
          style={[styles.backdrop, { opacity: backdropAnim }]}
        >
          <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={handleClose} />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.handleBar, { borderBottomColor: theme.border }]}>
          <View style={[styles.handleIndicator, { backgroundColor: theme.textMuted }]} />
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.6}>
            <Text style={[styles.closeIcon, { color: theme.textSecondary }]}>⌄</Text>
            <Text style={[styles.closeText, { color: theme.textSecondary }]}>Fermer</Text>
          </TouchableOpacity>
        </View>

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
              <Text style={[styles.quickBtnText, { color: qa.value > 0 ? theme.success : theme.danger }]}>
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
                    if (key === '⌫') onDelete();
                    else onKeyPress(key);
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </Animated.View>
    </>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
  backdropTouch: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    zIndex: 20,
    elevation: 20,
  },
  handleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    position: 'relative',
  },
  handleIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    top: 6,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  closeIcon: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 22,
  },
  closeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionsRow: { maxHeight: 44, marginTop: 8 },
  suggestionsContent: { paddingHorizontal: 12, gap: 8, alignItems: 'center' },
  suggestion: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  suggestionText: { fontSize: 13, fontWeight: '700' },
  quickRow: { maxHeight: 44, marginTop: 8 },
  quickContent: { paddingHorizontal: 12, gap: 6, alignItems: 'center' },
  quickBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  quickBtnText: { fontSize: 13, fontWeight: '700' },
  quickSeparator: { width: 1, height: 24, backgroundColor: '#333', marginHorizontal: 4 },
  smicBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  smicBtnText: { fontSize: 13, fontWeight: '800' },
  keysGrid: { marginTop: 10, paddingHorizontal: 16, gap: 8 },
  keyRow: { flexDirection: 'row', gap: 8 },
  key: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  keyText: { fontSize: 22, fontWeight: '700' },
});
