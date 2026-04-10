import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../features/theme/ThemeProvider';
import { EditableFieldWrapper } from './EditableFieldWrapper';
import { formatCurrency } from '../utils/format';

interface EditableValueProps {
  label: string;
  value: number;
  symbol: string;
  isActive: boolean;
  isPrimary?: boolean;
  onPress: () => void;
}

export const EditableValue = React.memo(function EditableValue({
  label,
  value,
  symbol,
  isActive,
  isPrimary = false,
  onPress,
}: EditableValueProps) {
  const { theme } = useTheme();

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <EditableFieldWrapper isActive={isActive}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.container}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
        <Text
          style={[styles.value, { color: isPrimary ? theme.primary : theme.text, fontSize: isPrimary ? 16 : 14 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCurrency(value, symbol)}
        </Text>
        {isActive && <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />}
      </TouchableOpacity>
    </EditableFieldWrapper>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, position: 'relative' },
  label: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  value: { fontWeight: '800' },
  activeDot: { position: 'absolute', top: 6, right: 6, width: 5, height: 5, borderRadius: 3 },
});
