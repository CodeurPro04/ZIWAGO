import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, Phone, MessageCircle, MapPin, Car, Sparkles, Clock } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useUserStore } from '@/hooks/useUserData';

export default function TrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { activities, addActivity } = useUserStore();

  const washerName = (params.washerName as string) || 'Jean K.';
  const washerFirstName = (params.washerFirstName as string) || 'Jean';
  const washerPhone = (params.washerPhone as string) || '+225 07 07 07 07 07';
  const washerRating = parseFloat((params.washerRating as string) || '4.9');
  const washerReviews = parseInt((params.washerReviews as string) || '247', 10);
  const arrivalTime = (params.arrivalTime as string) || '8';

  const location = decodeURIComponent((params.address as string) || 'Riviera 2, Carrefour Duncan');
  const vehicle = decodeURIComponent((params.vehicle as string) || 'Berline');
  const washType = decodeURIComponent((params.washType as string) || 'Extérieur uniquement');
  const price = parseInt((params.price as string) || '2000', 10);
  const scheduledAt = params.scheduledAt ? decodeURIComponent(params.scheduledAt as string) : null;

  const bookingIdRef = useRef((params.bookingId as string) || `bk-${Date.now()}`);
  const bookingId = bookingIdRef.current;

  useEffect(() => {
    if (activities.some((item) => item.id === bookingId)) return;
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const dateLabel = `Aujourd'hui, ${hours}:${minutes}`;

    addActivity({
      id: bookingId,
      status: 'pending',
      title: `Lavage ${washType}`,
      vehicle,
      washer: washerName,
      date: dateLabel,
      price,
      rating: null,
    });
  }, [activities, addActivity, bookingId, washType, vehicle, washerName, price]);

  const steps = useMemo(
    () => [
      { title: 'Laveur confirmé', subtitle: `${washerFirstName} se prépare` },
      { title: 'En route', subtitle: `Arrive dans ${arrivalTime} min` },
      { title: 'Lavage en cours', subtitle: 'Nettoyage en cours' },
      { title: 'Terminé', subtitle: 'Réservation terminée' },
    ],
    [arrivalTime, washerFirstName]
  );

  const handleCall = () => Linking.openURL(`tel:${washerPhone}`);
  const handleMessage = () => Linking.openURL(`sms:${washerPhone}`);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi de la réservation</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.washerCard}>
          <View style={styles.washerHeader}>
            <View style={styles.washerAvatar}>
              <Text style={styles.washerInitials}>{washerFirstName.charAt(0)}</Text>
            </View>
            <View style={styles.washerInfo}>
              <Text style={styles.washerName}>{washerName}</Text>
              <View style={styles.ratingRow}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingText}>{washerRating.toFixed(1)}</Text>
                <Text style={styles.reviewText}>({washerReviews} avis)</Text>
              </View>
            </View>
          </View>

          <View style={styles.washerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Phone size={16} color={Colors.primary} />
              <Text style={styles.actionText}>Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
              <MessageCircle size={16} color={Colors.primary} />
              <Text style={styles.actionText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Clock size={18} color={Colors.primary} />
            <Text style={styles.statusTitle}>Arrivée estimée</Text>
          </View>
          <Text style={styles.statusTime}>{arrivalTime} min</Text>
          <Text style={styles.statusSubtitle}>
            Votre laveur est en route vers l&lsquo;adresse sélectionnée.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Vous pouvez quitter cette page</Text>
          <Text style={styles.infoText}>
            La commande restera disponible dans Activités pour la marquer comme terminée après le lavage.
          </Text>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Progression</Text>
          {steps.map((step, index) => {
            const isActive = index <= 1;
            return (
              <View key={step.title} style={styles.progressRow}>
                <View style={[styles.progressDot, isActive && styles.progressDotActive]} />
                <View style={styles.progressContent}>
                  <Text style={[styles.progressText, isActive && styles.progressTextActive]}>
                    {step.title}
                  </Text>
                  <Text style={styles.progressSubtext}>{step.subtitle}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Récapitulatif</Text>
          <View style={styles.summaryRow}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.summaryText}>{location}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Car size={16} color={Colors.primary} />
            <Text style={styles.summaryText}>{vehicle}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Sparkles size={16} color={Colors.primary} />
            <Text style={styles.summaryText}>{washType}</Text>
          </View>
          {scheduledAt && (
            <View style={styles.summaryRow}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.summaryText}>{scheduledAt}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>{price.toLocaleString()} FCFA</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Voir mes activités"
            onPress={() => {
              router.replace('/(tabs)/activity');
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: Spacing.md,
    color: Colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  washerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  washerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  washerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  washerInitials: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  washerInfo: {
    flex: 1,
  },
  washerName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  reviewText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  washerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.secondary,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  statusTime: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  statusSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  progressTitle: {
    ...Typography.heading,
    marginBottom: Spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
    marginTop: 6,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  progressContent: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  progressTextActive: {
    color: Colors.text,
  },
  progressSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  summaryTitle: {
    ...Typography.heading,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
