import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../features/theme/ThemeProvider';
import { formatCurrency } from '../utils/format';

const KEYBOARD_HEIGHT = 380;
const ANIM_DURATION = 250;

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
}: CustomKeyboardProps) {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(KEYBOARD_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const isVisible = useRef(false);

  useEffect(() => {
    if (visible && !isVisible.current) {
      isVisible.current = true;
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: ANIM_DURATION, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: ANIM_DURATION, useNativeDriver: true }),
      ]).start();
    } else if (!visible && isVisible.current) {
      isVisible.current = false;
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: KEYBOARD_HEIGHT, duration: ANIM_DURATION, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: ANIM_DURATION, useNativeDriver: true }),
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
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        style={[styles.backdrop, { opacity: backdropAnim }]}
      >
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        style={[
          styles.container,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={0.7}
          style={[styles.closeBar, { borderBottomColor: theme.border }]}
        >
          <View style={styles.closeBarInner}>
            <Text style={[styles.closeArrow, { color: theme.textSecondary }]}>↓</Text>
            <Text style={[styles.closeLabel, { color: theme.textSecondary }]}>Fermer</Text>
          </View>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickRow}
          contentContainerStyle={styles.quickContent}
        >
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
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 10,
  },
  backdropTouch: { flex: 1 },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 28,
    zIndex: 20,
    elevation: 20,
  },
  closeBar: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  closeBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  closeArrow: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  quickRow: { maxHeight: 46, marginTop: 10 },
  quickContent: { paddingHorizontal: 14, gap: 8, alignItems: 'center' },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  quickBtnText: { fontSize: 14, fontWeight: '700' },
  smicBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5 },
  smicBtnText: { fontSize: 14, fontWeight: '800' },
  suggestionsRow: { maxHeight: 44, marginTop: 8 },
  suggestionsContent: { paddingHorizontal: 14, gap: 8, alignItems: 'center' },
  suggestion: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  suggestionText: { fontSize: 13, fontWeight: '700' },
  keysGrid: { marginTop: 12, paddingHorizontal: 16, gap: 8 },
  keyRow: { flexDirection: 'row', gap: 8 },
  key: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  keyText: { fontSize: 24, fontWeight: '700' },
});
