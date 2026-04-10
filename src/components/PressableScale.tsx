import React, { useCallback, useRef } from 'react';
import { Animated, TouchableOpacity, type ViewStyle } from 'react-native';

interface Props {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  scale?: number;
  disabled?: boolean;
}

export const PressableScale = React.memo(function PressableScale({
  onPress,
  children,
  style,
  scale = 0.97,
  disabled = false,
}: Props) {
  const anim = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(anim, { toValue: scale, useNativeDriver: true, friction: 8 }).start();
  }, [anim, scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  }, [anim]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
});
