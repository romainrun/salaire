import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../features/theme/ThemeProvider';

interface ImmersiveBackgroundProps {
  compact?: boolean;
}

export function ImmersiveBackground({ compact = false }: ImmersiveBackgroundProps) {
  const { theme, isDark } = useTheme();
  const drift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 4500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 4500, useNativeDriver: true }),
      ])
    );
    driftLoop.start();
    pulseLoop.start();
    return () => {
      driftLoop.stop();
      pulseLoop.stop();
    };
  }, [drift, pulse]);

  const orbOneY = drift.interpolate({ inputRange: [0, 1], outputRange: [-12, 24] });
  const orbTwoY = drift.interpolate({ inputRange: [0, 1], outputRange: [14, -26] });
  const orbOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.16, 0.32] });

  const backgroundColors: readonly [string, string, string] = isDark
    ? [theme.background, '#151528', '#121622']
    : [theme.background, '#EEF0FF', '#F5EFFE'];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={backgroundColors} style={StyleSheet.absoluteFill} />
      <Animated.View
        style={[
          styles.orb,
          styles.orbPrimary,
          compact && styles.compactOrbPrimary,
          {
            backgroundColor: theme.primary,
            opacity: orbOpacity,
            transform: [{ translateY: orbOneY }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbSecondary,
          compact && styles.compactOrbSecondary,
          {
            backgroundColor: theme.secondary,
            opacity: orbOpacity,
            transform: [{ translateY: orbTwoY }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPrimary: {
    width: 280,
    height: 280,
    top: -110,
    right: -90,
  },
  orbSecondary: {
    width: 220,
    height: 220,
    bottom: 80,
    left: -70,
  },
  compactOrbPrimary: {
    width: 200,
    height: 200,
    top: -84,
    right: -74,
  },
  compactOrbSecondary: {
    width: 160,
    height: 160,
    bottom: 120,
    left: -56,
  },
});
