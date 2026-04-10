import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../features/theme/ThemeProvider';
import { formatCurrency } from '../utils/format';
import type { SimulationHistoryItem } from '../types';

interface Props {
  item: SimulationHistoryItem;
  symbol: string;
  onPress: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export const HistoryItemRow = React.memo(function HistoryItemRow({ item, symbol, onPress, onDelete, onToggleFavorite }: Props) {
  const { theme } = useTheme();

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer cette simulation ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity onPress={onPress} onLongPress={handleDelete} style={[styles.container, { borderBottomColor: theme.border }]}>
      <TouchableOpacity onPress={onToggleFavorite} style={styles.favBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.favIcon}>{item.favorite ? '⭐' : '☆'}</Text>
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.date, { color: theme.textMuted }]}>
          {new Date(item.createdAt).toLocaleDateString('fr-FR')}
        </Text>
      </View>
      <Text style={[styles.value, { color: theme.primary }]}>
        {formatCurrency(item.results.netMonthly, symbol)}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, gap: 8 },
  favBtn: { padding: 2 },
  favIcon: { fontSize: 14 },
  info: { flex: 1 },
  title: { fontSize: 13, fontWeight: '600' },
  date: { fontSize: 10, marginTop: 1 },
  value: { fontSize: 14, fontWeight: '700' },
});
