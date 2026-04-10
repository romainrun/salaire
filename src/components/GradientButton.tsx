import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../features/theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  compact?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export function GradientButton({
  title,
  onPress,
  variant = 'primary',
  compact = false,
  disabled = false,
  loading = false,
}: GradientButtonProps) {
  const { theme } = useTheme();

  const gradientColors =
    variant === 'danger'
      ? theme.gradientDanger
      : variant === 'secondary'
      ? theme.gradientSecondary
      : theme.gradient;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.wrapper, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, compact && styles.compact]}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={[styles.text, compact && styles.textCompact]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  compact: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  textCompact: {
    fontSize: 14,
  },
});
