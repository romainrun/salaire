import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../features/theme/ThemeProvider';
import { formatCurrency } from '../utils/format';

interface EditableValueProps {
  label: string;
  value: number;
  symbol: string;
  isActive: boolean;
  isPrimary?: boolean;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const EditableValue = React.memo(function EditableValue({
  label,
  value,
  symbol,
  isActive,
  isPrimary = false,
  onPress,
}: EditableValueProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress, scale]);

  return (
    <AnimatedTouchable
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: isActive ? theme.primary + '15' : theme.surfaceLight,
          borderColor: isActive ? theme.primary : theme.border,
        },
        animStyle,
      ]}
    >
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Text
        style={[
          styles.value,
          {
            color: isPrimary ? theme.primary : theme.text,
            fontSize: isPrimary ? 22 : 18,
          },
        ]}
        numberOfLines={1}
      >
        {formatCurrency(value, symbol)}
      </Text>
      {isActive && (
        <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />
      )}
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    position: 'relative',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
