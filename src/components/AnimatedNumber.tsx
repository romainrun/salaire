import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated, type StyleProp, type TextStyle } from 'react-native';
import { formatAmount } from '../utils/formatCurrency';

interface Props {
  value: number;
  symbol?: string;
  style?: StyleProp<TextStyle>;
  duration?: number;
}

export const AnimatedNumber = React.memo(function AnimatedNumber({
  value,
  symbol = '€',
  style,
  duration = 300,
}: Props) {
  const [display, setDisplay] = useState(formatAmount(value, symbol));
  const prevValue = useRef(value);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (prevValue.current === value) return;

    const from = prevValue.current;
    const to = value;
    prevValue.current = to;

    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.03, duration: 80, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    const steps = Math.min(20, Math.max(8, Math.ceil(duration / 16)));
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplay(formatAmount(current, symbol));
      if (step >= steps) {
        clearInterval(interval);
        setDisplay(formatAmount(to, symbol));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, symbol, duration, pulseAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <Text style={style} numberOfLines={1} adjustsFontSizeToFit>
        {display}
      </Text>
    </Animated.View>
  );
});
