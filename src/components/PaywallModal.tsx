import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../features/theme/ThemeProvider';
import { AppCard } from './AppCard';
import { GradientButton } from './GradientButton';
import { useOneTimeProduct } from '../features/premium/useOneTimeProduct';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onWatchAd?: () => void;
}

export function PaywallModal({
  visible,
  onClose,
  onWatchAd,
}: PaywallModalProps) {
  const { theme } = useTheme();
  const { displayPrice, loadingPrice, purchasing, purchaseError, buy } = useOneTimeProduct();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <AppCard style={{ ...styles.card, borderColor: theme.primary + '55' }}>
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>PREMIUM</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>🚀 Passe en Premium</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Débloque toute la puissance du calculateur en un seul achat.
          </Text>
          <Text style={[styles.bullet, { color: theme.textSecondary }]}>✔ Aucune publicité</Text>
          <Text style={[styles.bullet, { color: theme.textSecondary }]}>✔ Comparaison illimitée</Text>
          <Text style={[styles.bullet, { color: theme.textSecondary }]}>✔ Simulations avancées</Text>
          <Text style={[styles.bullet, { color: theme.textSecondary }]}>✔ Historique complet</Text>
          <View style={[styles.priceCard, { backgroundColor: theme.primary + '20', borderColor: theme.primary + '55' }]}>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Achat unique</Text>
            {loadingPrice ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <Text style={[styles.price, { color: theme.primary }]}>{displayPrice}</Text>
            )}
          </View>
          {purchaseError ? (
            <Text style={[styles.errorText, { color: theme.warning }]}>{purchaseError}</Text>
          ) : null}

          <View style={styles.actions}>
            <GradientButton
              title={purchasing ? 'Achat en cours...' : 'Activer Premium'}
              onPress={() => { void buy(); }}
              compact
              loading={purchasing}
              disabled={purchasing}
            />
            {onWatchAd ? (
              <GradientButton
                title="Regarder une pub"
                onPress={onWatchAd}
                compact
                variant="secondary"
                disabled={purchasing}
              />
            ) : null}
            <TouchableOpacity onPress={onClose} style={styles.secondaryBtn} disabled={purchasing}>
              <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>
                Continuer avec les pubs
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
  badgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD166',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeText: {
    color: '#2B2B2B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  bullet: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: '600',
  },
  priceCard: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
