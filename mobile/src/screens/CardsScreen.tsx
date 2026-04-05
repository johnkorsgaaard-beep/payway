import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';
import { useAuth } from '../store/auth';
import { EmptyState } from '../components/EmptyState';

const BRAND_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  visa: 'card',
  mastercard: 'card',
  amex: 'card',
};

export function CardsScreen() {
  const C = useColors();
  const styles = makeStyles(C);
  const { user } = useAuth();
  const [cards, setCards] = useState(user?.cards || []);

  const handleRemoveCard = (cardId: string, last4: string) => {
    Alert.alert(
      'Fjern kort',
      `Er du sikker på du vil fjerne kort **** ${last4}?`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Fjern',
          style: 'destructive',
          onPress: () => setCards((prev) => prev.filter((c) => c.id !== cardId)),
        },
      ]
    );
  };

  const handleAddCard = () => {
    Alert.alert('Tilføj kort', 'Stripe kort-tilføjelse åbnes her i produktionsversionen.');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Dine betalingskort</Text>
        <Text style={styles.subtitle}>
          Administrer de kort der bruges til optankning af din wallet
        </Text>

        {cards.length === 0 ? (
          <EmptyState
            icon="card-outline"
            iconColor="#d97706"
            iconBg="#fef3c7"
            title="Ingen kort endnu"
            description="Tilknyt et Visa eller Mastercard, så du hurtigt kan fylde din wallet op."
            actionLabel="Tilføj kort"
            onAction={handleAddCard}
            compact
          />
        ) : (
          <View style={styles.cardList}>
            {cards.map((card) => (
              <View key={card.id} style={styles.cardRow}>
                <View style={styles.cardIcon}>
                  <Ionicons
                    name={BRAND_ICONS[card.brand] || 'card'}
                    size={24}
                    color={C.accent}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.cardNameRow}>
                    <Text style={styles.cardBrand}>
                      {card.brand.toUpperCase()}
                    </Text>
                    {card.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Standard</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardNumber}>**** **** **** {card.last4}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveCard(card.id, card.last4)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={18} color={C.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.addButtonText}>Tilføj nyt kort</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: SPACING.xl },
  heading: { fontSize: 22, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 14, color: C.textSecondary, marginTop: SPACING.xs, marginBottom: SPACING.lg },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.sm },
  emptyText: { fontSize: 16, fontWeight: '600', color: C.textSecondary },
  emptySubtext: { fontSize: 14, color: C.textLight, textAlign: 'center' },
  cardList: { gap: SPACING.sm },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e8faf0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardInfo: { flex: 1 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  cardBrand: { fontSize: 15, fontWeight: '700', color: C.text },
  defaultBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultText: { fontSize: 11, fontWeight: '600', color: C.success },
  cardNumber: { fontSize: 13, color: C.textSecondary, marginTop: 2, fontFamily: 'monospace' },
  removeButton: { padding: SPACING.sm },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: SPACING.lg,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
}
