import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../features/theme/ThemeProvider';
import { AppCard } from './AppCard';
import { GradientButton } from './GradientButton';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onWatchAd?: () => void;
}

export function PaywallModal({
  visible,
  onClose,
  onUpgrade,
  onWatchAd,
}: PaywallModalProps) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <AppCard style={styles.card}>
          <Text style={[styles.title, { color: theme.text }]}>🚀 Unlock full Salaire Net Brut Calculateur</Text>
          <Text style={[styles.bullet, { color: theme.textSecondary }]}>✔ Remove all ads</Text>
          <Text style={[styles.bullet, { color: theme.textSecondary }]}>✔ Unlimited salary comparisons</Text>
          <Text style={[styles.bullet, { color: theme.textSecondary }]}>✔ Advanced salary simulations</Text>
          <Text style={[styles.price, { color: theme.primary }]}>💰 One-time payment 3,99€</Text>

          <View style={styles.actions}>
            <GradientButton title="Upgrade now" onPress={onUpgrade} compact />
            {onWatchAd ? (
              <GradientButton
                title="Watch ad"
                onPress={onWatchAd}
                compact
                variant="secondary"
              />
            ) : null}
            <TouchableOpacity onPress={onClose} style={styles.secondaryBtn}>
              <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>
                Continue with ads
              </Text>
            </TouchableOpacity>
          </View>
        </AppCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    marginBottom: 0,
    borderRadius: 18,
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: '600',
  },
  price: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: '800',
  },
  actions: {
    marginTop: 14,
    gap: 10,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
