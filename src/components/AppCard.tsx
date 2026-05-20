import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../features/theme/ThemeProvider';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function AppCard({ children, style }: AppCardProps) {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: isDark ? theme.primary : '#000000',
        },
        style,
      ]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={isDark ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)'] : ['rgba(108,99,255,0.08)', 'rgba(108,99,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gloss}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 4,
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
