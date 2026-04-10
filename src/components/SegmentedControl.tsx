import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../features/theme/ThemeProvider';

interface SegmentedControlProps {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ values, selectedIndex, onChange }: SegmentedControlProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
      {values.map((label, index) => {
        const active = index === selectedIndex;
        return (
          <TouchableOpacity
            key={label}
            style={[styles.segment, active && { backgroundColor: theme.primary }]}
            onPress={() => onChange(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, { color: active ? '#FFFFFF' : theme.textSecondary }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderRadius: 10, padding: 2, borderWidth: 1 },
  segment: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 8 },
  label: { fontSize: 13, fontWeight: '600' },
});
