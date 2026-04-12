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

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1.02 : 1,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);
    animation.start();

    return () => {
      animation.stop();
    };
  }, [isActive, scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          borderColor: isActive ? theme.primary : theme.border,
          borderWidth: isActive ? 2 : 1,
          backgroundColor: isActive ? theme.primary + '12' : theme.surfaceLight,
          borderRadius: 10,
          ...(Platform.OS === 'ios'
            ? {
                shadowColor: theme.primary,
                shadowOpacity: isActive ? 0.5 : 0,
                shadowRadius: isActive ? 10 : 0,
                shadowOffset: { width: 0, height: 0 },
              }
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
