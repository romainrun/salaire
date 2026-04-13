import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppCard } from '../../components/AppCard';
import { GradientButton } from '../../components/GradientButton';

interface AdUnlockModalProps {
  visible: boolean;
  onClose: () => void;
  onWatchAd: () => void | Promise<void>;
  onAdFree?: () => void | Promise<void>;
  title?: string;
  description?: string;
}

export function AdUnlockModal({
  visible,
  onClose,
  onWatchAd,
  onAdFree,
  title = 'Débloquer cette fonctionnalité',
  description = 'Regardez une courte publicité pour continuer.',
}: AdUnlockModalProps) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <AppCard style={{ ...styles.card, borderColor: theme.primary + '55' }}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{description}</Text>

          <View style={styles.actions}>
            <GradientButton
              title="Regarder"
              onPress={() => {
                void onWatchAd();
              }}
              compact
            />
            {onAdFree ? (
              <GradientButton
                title="Supprimer les pubs 30 min"
                onPress={() => {
                  void onAdFree();
                }}
                compact
                variant="secondary"
              />
            ) : null}
            <TouchableOpacity onPress={onClose} style={styles.secondaryBtn}>
              <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>
                Annuler
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  actions: {
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
