import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../features/theme/ThemeProvider';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
}

export const EmptyState = React.memo(function EmptyState({ icon = '📊', title, message }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  icon: { fontSize: 32, marginBottom: 8 },
  title: { fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  message: { fontSize: 12, textAlign: 'center', lineHeight: 18, paddingHorizontal: 16 },
});
