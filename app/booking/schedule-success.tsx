import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, Clock, MapPin } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useUserStore } from '@/hooks/useUserData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ConfettiPiece = {
  id: number;
  x: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  rotate: number;
};

export default function ScheduleSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const addActivity = useUserStore((state) => state.addActivity);
  const activities = useUserStore((state) => state.activities);
  const walletBalance = useUserStore((state) => state.walletBalance);
  const updateUserData = useUserStore((state) => state.updateUserData);
  const addWalletTransaction = useUserStore((state) => state.addWalletTransaction);

  const address = params.address ? decodeURIComponent(params.address as string) : '';
  const vehicle = params.vehicle ? decodeURIComponent(params.vehicle as string) : '';
  const washType = params.washType ? decodeURIComponent(params.washType as string) : '';
  const price = params.price ? parseInt(params.price as string, 10) : 0;
  const scheduledAt = params.scheduledAt ? decodeURIComponent(params.scheduledAt as string) : '';
  const activityIdRef = useRef(`sched-${Date.now()}`);
  const billedRef = useRef(false);

  const pieces = useMemo<ConfettiPiece[]>(
    () =>
      Array.from({ length: 18 }).map((_, index) => ({
        id: index,
        x: Math.random() * (SCREEN_WIDTH - 24),
        size: 8 + Math.random() * 6,
        color: ['#4A6FFF', '#22C55E', '#F59E0B', '#FF6B8B', '#10B981'][
          index % 5
        ],
        delay: 150 * index,
        duration: 2200 + Math.random() * 900,
        rotate: Math.random() * 360,
      })),
    []
  );

  const confettiAnims = useRef(pieces.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = confettiAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: pieces[index].duration,
        delay: pieces[index].delay,
        useNativeDriver: true,
      })
    );
    Animated.stagger(120, animations).start();
  }, [confettiAnims, pieces]);

  useEffect(() => {
    const activityId = activityIdRef.current;
    const exists = activities.some((item) => item.id === activityId);
    if (exists) return;
    addActivity({
      id: activityId,
      status: 'pending',
      title: washType || 'Lavage programmé',
      vehicle: vehicle || 'Véhicule',
      washer: 'À confirmer',
      date: scheduledAt || 'Programmation en attente',
      price,
      rating: null,
    });
  }, [activities, addActivity, price, scheduledAt, vehicle, washType]);

  useEffect(() => {
    if (billedRef.current) return;
    billedRef.current = true;
    const nextBalance = Math.max(0, walletBalance - price);
    updateUserData('walletBalance', nextBalance);
    addWalletTransaction({
      id: `debit-${Date.now()}`,
      type: 'debit',
      title: `Programmation lavage - ${washType || 'Lavage'}`,
      date: scheduledAt || "Aujourd'hui",
      amount: price,
    });
  }, [addWalletTransaction, price, scheduledAt, updateUserData, walletBalance, washType]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.confettiLayer} pointerEvents="none">
        {pieces.map((piece, index) => {
          const translateY = confettiAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [-40, SCREEN_HEIGHT + 40],
          });
          const translateX = confettiAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [piece.x, piece.x + (index % 2 === 0 ? 40 : -40)],
          });
          const rotate = confettiAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', `${piece.rotate}deg`],
          });

          return (
            <Animated.View
              key={`confetti-${piece.id}`}
              style={[
                styles.confettiPiece,
                {
                  width: piece.size,
                  height: piece.size * 1.6,
                  backgroundColor: piece.color,
                  transform: [{ translateX }, { translateY }, { rotate }],
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <CheckCircle size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Programmation confirmée</Text>
        <Text style={styles.subtitle}>
          Votre demande a été prise en compte. Un laveur validera la réservation.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.summaryText} numberOfLines={2}>
              {address || 'Adresse renseignée'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Clock size={16} color={Colors.primary} />
            <Text style={styles.summaryText}>{scheduledAt || 'Créneau programmé'}</Text>
          </View>
          <Text style={styles.summaryMeta}>{vehicle}</Text>
          <Text style={styles.summaryMeta}>{washType}</Text>
          <Text style={styles.summaryPrice}>{price.toLocaleString()} F CFA</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.primaryButtonText}>Retour à l’accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            router.push({
              pathname: '/booking/activity-details',
              params: {
                id: activityIdRef.current,
                status: 'pending',
                title: washType,
                vehicle,
                washer: 'À confirmer',
                date: scheduledAt,
                price: price.toString(),
                rating: '',
              },
            })
          }
        >
          <Text style={styles.secondaryButtonText}>Voir les détails</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.heading,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    marginTop: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
