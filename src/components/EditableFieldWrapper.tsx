import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../features/theme/ThemeProvider';

interface Props {
  isActive: boolean;
  children: React.ReactNode;
}

export const EditableFieldWrapper = React.memo(function EditableFieldWrapper({ isActive, children }: Props) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.7)).current;
  const glowAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: isActive ? 1.02 : 1, useNativeDriver: true, friction: 8 }),
      Animated.timing(opacityAnim, { toValue: isActive ? 1 : 0.7, duration: 200, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: isActive ? 1 : 0, duration: 200, useNativeDriver: false }),
    ]).start();
  }, [isActive, scaleAnim, opacityAnim, glowAnim]);

  const shadowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] });
  const shadowRadius = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
  const borderWidth = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2] });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          borderColor: isActive ? theme.primary : theme.border,
          borderWidth,
          backgroundColor: isActive ? theme.primary + '12' : theme.surfaceLight,
          borderRadius: 10,
          ...(Platform.OS === 'ios'
            ? { shadowColor: theme.primary, shadowOpacity, shadowRadius, shadowOffset: { width: 0, height: 0 } }
            : { elevation: isActive ? 4 : 0 }),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: { overflow: 'hidden' },
});
