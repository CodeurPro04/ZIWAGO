import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Car, User, Clock, CheckCircle, XCircle, Calendar, ChevronLeft, Star, Phone, MapPin } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useUserStore } from '@/hooks/useUserData';
import BerlineSvg from '@/assets/svg/berline.svg';
import CompacteSvg from '@/assets/svg/compacte.svg';
import SuvSvg from '@/assets/svg/suv.svg';
import GroupSvg from '@/assets/svg/Group.svg';
import Group5Svg from '@/assets/svg/Group5.svg';
import Group7Svg from '@/assets/svg/Group7.svg';
import { getBooking, rateBooking } from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  completed: { label: 'Termine', color: '#16A34A', bg: '#DCFCE7', icon: CheckCircle },
  pending: { label: 'En attente', color: '#F59E0B', bg: '#FEF3C7', icon: Calendar },
  accepted: { label: 'En route', color: '#2563EB', bg: '#DBEAFE', icon: CheckCircle },
  en_route: { label: 'En route', color: '#2563EB', bg: '#DBEAFE', icon: CheckCircle },
  arrived: { label: 'Arrive', color: '#7C3AED', bg: '#EDE9FE', icon: CheckCircle },
  washing: { label: 'Lavage en cours', color: '#0EA5E9', bg: '#E0F2FE', icon: Clock },
  cancelled: { label: 'Annule', color: '#EF4444', bg: '#FEE2E2', icon: XCircle },
};

type FollowStep = {
  key: string;
  title: string;
  subtitle: string;
};

const FOLLOW_STEPS: FollowStep[] = [
  { key: 'accepted', title: 'Le laveur est en route vers vous', subtitle: 'Le laveur a accepte la course' },
  { key: 'arrived', title: 'Le laveur est arrive', subtitle: 'Le laveur est sur place' },
  { key: 'washing', title: 'Le lavage a demarre', subtitle: 'Le nettoyage est en cours' },
  { key: 'completed', title: 'Lavage termine', subtitle: 'Votre vehicule est pret' },
];

const toDisplayDate = (raw: string) => {
  const value = (raw || '').trim();
  const now = new Date();
  const lower = value.toLowerCase();

  if (!value) {
    return now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  if (lower.includes("aujourd")) {
    return now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  if (lower.includes('demain')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return tomorrow.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  return value;
};

const statusProgressIndex = (status: string) => {
  switch (status) {
    case 'accepted':
    case 'en_route':
      return 0;
    case 'arrived':
      return 1;
    case 'washing':
      return 2;
    case 'completed':
      return 3;
    default:
      return -1;
  }
};

export default function ActivityDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activityId = (params.id as string) || '';
  const fromReservation = params.fromReservation === '1';
  const backendCustomerId = useUserStore((state) => state.backendCustomerId);
  const realtimeVersion = useUserStore((state) => state.realtimeVersion);
  const activity = useUserStore((state) => state.activities.find((item) => item.id === activityId));
  const updateActivityRating = useUserStore((state) => state.updateActivityRating);
  const updateActivityStatus = useUserStore((state) => state.updateActivityStatus);

  const [bookingStatus, setBookingStatus] = useState((params.status as string) || activity?.status || 'pending');
  const [title, setTitle] = useState((params.title as string) || activity?.title || 'Lavage Premium');
  const [vehicle, setVehicle] = useState((params.vehicle as string) || activity?.vehicle || 'Berline');
  const [washerName, setWasherName] = useState((params.washer as string) || activity?.washer || 'Laveur');
  const [washerPhone, setWasherPhone] = useState((params.washerPhone as string) || '');
  const [washerAvatar, setWasherAvatar] = useState((params.washerAvatar as string) || '');
  const [washerRating, setWasherRating] = useState(params.washerRating ? parseFloat(params.washerRating as string) : 4.8);
  const [washerReviews, setWasherReviews] = useState(params.washerReviews ? parseInt(params.washerReviews as string, 10) : 0);
  const [eta, setEta] = useState(params.eta ? parseInt(params.eta as string, 10) : null as number | null);
  const [address, setAddress] = useState((params.address as string) || '');
  const [date, setDate] = useState((params.date as string) || activity?.date || "Aujourd'hui");
  const [price, setPrice] = useState(parseInt((params.price as string) || String(activity?.price || 0), 10));
  const [localRating, setLocalRating] = useState<number | null>(activity?.rating ?? (params.rating ? parseFloat(params.rating as string) : null));
  const [localReview, setLocalReview] = useState<string>('');
  const [draftRating, setDraftRating] = useState<number>(activity?.rating ?? 0);
  const [draftReview, setDraftReview] = useState<string>('');
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [lastRefreshAt, setLastRefreshAt] = useState<Date | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const loadBookingDetails = useCallback(async () => {
    if (!activityId) return;

    const response = await getBooking(activityId);
    const booking = response.booking;

    const nextStatus = booking.status || 'pending';
    setBookingStatus(nextStatus);
    setTitle(booking.service || title);
    setVehicle(booking.vehicle || vehicle);
    setWasherName(booking.driver?.name || washerName);
    setWasherPhone(booking.driver?.phone || washerPhone);
    setWasherAvatar(booking.driver?.avatar_url || washerAvatar);
    setWasherRating(Number(booking.driver?.rating || washerRating || 4.8));
    setWasherReviews(Number(booking.driver?.reviews_count || washerReviews || 0));
    setAddress(booking.address || address);
    setDate(booking.scheduled_at || date);
    setPrice(Number(booking.price || price));
    setBeforePhotos(booking.before_photos || []);
    setAfterPhotos(booking.after_photos || []);
    setLastRefreshAt(new Date());

    if (activityId) {
      updateActivityStatus(activityId, nextStatus);
    }

    if (booking.customer_rating) {
      setLocalRating(Number(booking.customer_rating));
      setDraftRating(Number(booking.customer_rating));
      updateActivityRating(activityId, Number(booking.customer_rating));
    }
    setLocalReview((booking.customer_review || '').trim());
    if (!localRating && !draftReview) {
      setDraftReview((booking.customer_review || '').trim());
    }

    return nextStatus;
  }, [activityId, address, date, draftReview, localRating, price, title, updateActivityRating, updateActivityStatus, vehicle, washerAvatar, washerName, washerPhone, washerRating, washerReviews]);

  useEffect(() => {
    if (!activityId) return;

    loadBookingDetails().catch(() => undefined);

    if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    // Fallback polling: websocket is primary, interval keeps data safe if socket drops.
    pollRef.current = setInterval(() => {
      loadBookingDetails().catch(() => undefined);
    }, 15000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [activityId, loadBookingDetails]);

  useEffect(() => {
    if (!activityId) return;
    loadBookingDetails().catch(() => undefined);
  }, [activityId, loadBookingDetails, realtimeVersion]);

  useEffect(() => {
    const timer = setInterval(() => setRefreshTick((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const statusConfig = STATUS_CONFIG[bookingStatus] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  const normalizedTitle = useMemo(() => title.toLowerCase(), [title]);
  const normalizedVehicle = useMemo(() => vehicle.toLowerCase(), [vehicle]);
  const VehicleIcon = normalizedVehicle.includes('suv') ? SuvSvg : normalizedVehicle.includes('compact') ? CompacteSvg : normalizedVehicle.includes('berline') ? BerlineSvg : Car;
  const WashIcon = normalizedTitle.includes('complet') ? Group7Svg : normalizedTitle.includes('interieur') ? Group5Svg : GroupSvg;

  const followIndex = statusProgressIndex(bookingStatus);
  const displayDate = useMemo(() => toDisplayDate(date), [date]);
  const refreshLabel = useMemo(() => {
    if (!lastRefreshAt) return 'Mise a jour en attente';
    const seconds = Math.max(0, Math.floor((Date.now() - lastRefreshAt.getTime()) / 1000));
    if (seconds < 5) return 'Mis a jour a l instant';
    if (seconds < 60) return `Mis a jour il y a ${seconds} sec`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Mis a jour il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `Mis a jour il y a ${hours} h`;
  }, [lastRefreshAt, refreshTick]);

  const submitRating = async () => {
    if (!backendCustomerId || !activityId || draftRating <= 0) {
      Alert.alert('Erreur', 'Impossible de noter cette reservation.');
      return;
    }

    try {
      const cleanedReview = draftReview.trim();
      await rateBooking(activityId, {
        customer_id: backendCustomerId,
        rating: draftRating,
        review: cleanedReview || undefined,
      });
      setLocalRating(draftRating);
      setLocalReview(cleanedReview);
      updateActivityRating(activityId, draftRating);
    } catch {
      Alert.alert('Erreur', 'Echec lors de l enregistrement de la note.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {fromReservation ? <View style={styles.headerPlaceholder} /> : (
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={20} color={Colors.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Details de commande</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <StatusIcon size={16} color={statusConfig.color} />
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
          <Text style={styles.statusTitle}>{title}</Text>
          <Text style={styles.statusSubtitle}>{displayDate}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Suivi de commande</Text>
            <Text style={styles.refreshInfo}>{refreshLabel}</Text>
          </View>
          <View style={styles.timelineCard}>
            {FOLLOW_STEPS.map((step, index) => {
              const isCompletedStep = step.key === 'completed';
              const forceDoneForCompleted = bookingStatus === 'completed' && isCompletedStep;
              const isDone = followIndex > index || forceDoneForCompleted;
              const isCurrent = followIndex === index && !forceDoneForCompleted;
              const isUpcoming = followIndex < index;
              return (
                <View key={step.key} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        isDone && styles.timelineDotDone,
                        isCurrent && styles.timelineDotCurrent,
                        isUpcoming && styles.timelineDotUpcoming,
                      ]}
                    />
                    {index < FOLLOW_STEPS.length - 1 ? (
                      <View style={[styles.timelineLine, (isDone || isCurrent) && styles.timelineLineDone]} />
                    ) : null}
                  </View>
                  <View style={styles.timelineBody}>
                    <Text style={[styles.timelineTitle, isCurrent && styles.timelineTitleCurrent]}>{step.title}</Text>
                    <Text style={styles.timelineSubtitle}>{step.subtitle}</Text>
                    {step.key === 'washing' ? (
                      <Text style={styles.timelinePhotoHint}>
                        Photos avant lavage: {beforePhotos.length} | Photos apres lavage: {afterPhotos.length}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
            {bookingStatus === 'cancelled' ? (
              <View style={styles.cancelledPill}>
                <Text style={styles.cancelledText}>Commande annulee</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Laveur</Text>
          <View style={styles.washerCard}>
            <Image source={washerAvatar ? { uri: washerAvatar } : require('@/assets/images/default-avatar.jpeg')} style={styles.washerAvatar} />
            <View style={styles.washerInfo}>
              <Text style={styles.washerName}>{washerName}</Text>
              <View style={styles.ratingRow}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.washerRatingText}>{washerRating.toFixed(1)}</Text>
                <Text style={styles.reviewText}>({washerReviews} avis)</Text>
              </View>
            </View>
            {washerPhone ? (
              <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL(`tel:${washerPhone}`)}>
                <Phone size={16} color="#FFF" />
                <Text style={styles.callButtonText}>Appeler</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.infoRow}>{VehicleIcon === Car ? <Car size={16} color={Colors.primary} /> : <VehicleIcon width={18} height={18} />}<Text style={styles.infoText}>{vehicle}</Text></View>
          <View style={styles.infoRow}><WashIcon width={18} height={18} /><Text style={styles.infoText}>{title}</Text></View>
          {address ? <View style={styles.infoRow}><MapPin size={16} color={Colors.primary} /><Text style={styles.infoText}>{address}</Text></View> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paiement</Text>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>{price.toLocaleString()} F CFA</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos du lavage</Text>
          {beforePhotos.length > 0 && (
            <>
              <Text style={styles.photoTitle}>Avant lavage</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                {beforePhotos.map((uri, i) => (
                  <TouchableOpacity key={`bf-${i}`} activeOpacity={0.9} onPress={() => setPreviewUri(uri)}>
                    <Image source={{ uri }} style={styles.photoItem} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
          {afterPhotos.length > 0 && (
            <>
              <Text style={styles.photoTitle}>Apres lavage</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                {afterPhotos.map((uri, i) => (
                  <TouchableOpacity key={`af-${i}`} activeOpacity={0.9} onPress={() => setPreviewUri(uri)}>
                    <Image source={{ uri }} style={styles.photoItem} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
          {beforePhotos.length === 0 && afterPhotos.length === 0 ? <Text style={styles.noPhotos}>Aucune photo disponible pour le moment.</Text> : null}
        </View>

        {localRating ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votre note</Text>
            <View style={styles.ratingCard}><Star size={16} color="#F59E0B" fill="#F59E0B" /><Text style={styles.ratingText}>{localRating.toFixed(1)}</Text></View>
            {localReview ? <Text style={styles.reviewBody}>"{localReview}"</Text> : null}
          </View>
        ) : bookingStatus === 'completed' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Noter le service</Text>
            <View style={styles.rateInputCard}>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity key={value} style={styles.starButton} onPress={() => setDraftRating(value)}>
                    <Star size={22} color={value <= draftRating ? '#F59E0B' : '#D1D5DB'} fill={value <= draftRating ? '#F59E0B' : 'transparent'} />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reviewInput}
                placeholder="Votre avis (optionnel)"
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={350}
                value={draftReview}
                onChangeText={setDraftReview}
              />
              <TouchableOpacity style={[styles.submitRatingButton, draftRating === 0 && styles.submitRatingDisabled]} disabled={draftRating === 0} onPress={submitRating}>
                <Text style={styles.submitRatingText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {fromReservation && (
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.primaryActionButton} onPress={() => router.replace('/(tabs)/activity')}>
              <Text style={styles.primaryActionText}>Voir mes activites</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryActionButton} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.secondaryActionText}>Retour a l accueil</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={!!previewUri} transparent animationType="fade" onRequestClose={() => setPreviewUri(null)}>
        <View style={styles.previewOverlay}>
          <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewUri(null)} activeOpacity={0.85}>
            <Text style={styles.previewCloseText}>Fermer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.previewBackdrop} activeOpacity={1} onPress={() => setPreviewUri(null)}>
            {previewUri ? <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" /> : null}
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.background,
  },
  headerPlaceholder: { width: 36, height: 36 },
  backButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: Colors.text },
  headerSpacer: { width: 36 },
  content: { flex: 1, padding: Spacing.lg },
  statusCard: { backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg, gap: Spacing.sm },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusLabel: { fontSize: 12, fontWeight: '700' },
  statusTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statusSubtitle: { fontSize: 13, color: Colors.textSecondary },

  section: { marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.heading, marginBottom: Spacing.sm },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  refreshInfo: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  timelineLeft: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
    marginTop: 4,
  },
  timelineDotDone: {
    backgroundColor: '#16A34A',
  },
  timelineDotCurrent: {
    backgroundColor: Colors.primary,
  },
  timelineDotUpcoming: {
    backgroundColor: '#D1D5DB',
  },
  timelineLine: {
    width: 2,
    minHeight: 34,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: 4,
  },
  timelineLineDone: {
    backgroundColor: '#93C5FD',
  },
  timelineBody: {
    flex: 1,
    paddingBottom: 8,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  timelineTitleCurrent: {
    color: Colors.primary,
  },
  timelineSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  timelinePhotoHint: {
    marginTop: 4,
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
  cancelledPill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cancelledText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '700',
  },

  washerCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  washerAvatar: { width: 48, height: 48, borderRadius: 24 },
  washerInfo: { flex: 1 },
  washerName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  washerRatingText: { fontSize: 12, fontWeight: '700', color: '#F59E0B' },
  reviewText: { fontSize: 12, color: '#B45309' },
  callButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  callButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoText: { fontSize: 14, color: Colors.text, fontWeight: '600' },

  priceCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  priceLabel: { fontSize: 12, color: Colors.textSecondary },
  priceValue: { fontSize: 18, fontWeight: '700', color: Colors.primary },

  photoTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  photoRow: { gap: 10, paddingBottom: 10 },
  photoItem: { width: 130, height: 110, borderRadius: 12, backgroundColor: '#E5E7EB' },
  noPhotos: { fontSize: 12, color: Colors.textSecondary },
  previewOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.92)' },
  previewClose: {
    marginTop: Spacing.xl,
    marginRight: Spacing.lg,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  previewCloseText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  previewBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  previewImage: { width: '100%', height: '100%' },

  ratingCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#FEF3C7', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#FDE68A' },
  ratingText: { fontSize: 14, fontWeight: '700', color: '#F59E0B' },
  reviewBody: { marginTop: 8, fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
  rateInputCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  starButton: { padding: 4 },
  reviewInput: {
    minHeight: 86,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    textAlignVertical: 'top',
    fontSize: 13,
  },
  submitRatingButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 10 },
  submitRatingDisabled: { backgroundColor: '#CBD5F5' },
  submitRatingText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  actionSection: { marginTop: Spacing.sm, gap: Spacing.sm, marginBottom: Spacing.lg },
  primaryActionButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  primaryActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryActionButton: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  secondaryActionText: { color: Colors.text, fontSize: 14, fontWeight: '700' },
});
