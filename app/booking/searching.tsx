import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  MapPin,
  ShieldCheck,
  Star,
  Clock,
  Navigation,
  Locate,
  X,
  ChevronRight,
  CheckCircle,
} from 'lucide-react-native';


const MOCK_WASHERS = [
  {
    id: 1,
    name: 'Jean K.',
    firstName: 'Jean',
    rating: 4.9,
    reviews: 247,
    distance: 0.8,
    time: 8,
    color: '#4A6FFF',
    latitude: 5.3482,
    longitude: -4.0212,
    phoneNumber: '+225 07 07 07 07 07',
    badges: ['TOP', 'PRO'],
  },
  {
    id: 2,
    name: 'Marie K.',
    firstName: 'Marie',
    rating: 4.8,
    reviews: 189,
    distance: 1.2,
    time: 12,
    color: '#FF6B8B',
    latitude: 5.3463,
    longitude: -4.0228,
    phoneNumber: '+225 07 77 77 77 77',
    badges: ['RAPIDE'],
  },
  {
    id: 3,
    name: 'Paul A.',
    firstName: 'Paul',
    rating: 4.7,
    reviews: 132,
    distance: 0.5,
    time: 6,
    color: '#2ECC71',
    latitude: 5.3475,
    longitude: -4.0205,
    phoneNumber: '+225 01 23 45 67 89',
    badges: ['ECO'],
  },
];

const PHASES = [
  { key: 'searching', label: 'Recherche de laveurs', duration: 2500 },
  { key: 'matching', label: 'Analyse des disponibilites', duration: 2200 },
  { key: 'connecting', label: 'Connexion en cours', duration: 1800 },
  { key: 'found', label: 'Laveurs disponibles', duration: 0 },
];

export default function SearchWasherScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    address: paramAddress = 'Riviera 2, Carrefour Duncan',
    latitude: paramLatitude = '5.3482',
    longitude: paramLongitude = '-4.0212',
    vehicle: paramVehicle = 'Berline',
    washType: paramWashType = 'Exterieur',
    price: paramPrice = '2000',
    scheduledAt: paramScheduledAt = '',
  } = params;

  const booking = useMemo(
    () => ({
      location: decodeURIComponent(paramAddress as string),
      vehicle: decodeURIComponent(paramVehicle as string),
      washType: decodeURIComponent(paramWashType as string),
      price: parseInt(paramPrice as string, 10),
      scheduledAt: paramScheduledAt ? decodeURIComponent(paramScheduledAt as string) : '',
    }),
    [paramAddress, paramVehicle, paramWashType, paramPrice, paramScheduledAt]
  );

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [washers, setWashers] = useState<any[]>([]);
  const [selectedWasher, setSelectedWasher] = useState<any | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<Record<number, 'pending' | 'confirmed'>>({});
  const confirmationTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pendingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(pendingAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, [pendingAnim]);

  useEffect(() => {
    let timeout = 0;
    PHASES.forEach((phase, index) => {
      setTimeout(() => {
        setPhaseIndex(index);
        if (phase.key === 'found') {
          setWashers(MOCK_WASHERS);
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }).start();
        } else {
          setWashers(MOCK_WASHERS.slice(0, Math.max(1, index)));
          Animated.timing(progressAnim, {
            toValue: (index + 1) / PHASES.length,
            duration: phase.duration,
            useNativeDriver: false,
          }).start();
        }
      }, timeout);
      timeout += phase.duration;
    });
  }, [progressAnim]);

  useEffect(() => {
    const initLocation = async () => {
      const lat = parseFloat(paramLatitude as string);
      const lng = parseFloat(paramLongitude as string);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        const coords = { latitude: lat, longitude: lng };
        setUserLocation(coords);
        setMapRegion({ ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setUserLocation(coords);
        setMapRegion({ ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 });
      } catch (error) {
        const fallback = { latitude: 5.3482, longitude: -4.0212 };
        setUserLocation(fallback);
        setMapRegion({ ...fallback, latitudeDelta: 0.05, longitudeDelta: 0.05 });
      }
    };

    initLocation();
  }, [paramLatitude, paramLongitude]);

  const currentPhase = PHASES[phaseIndex];
  const selectedStatus = selectedWasher ? confirmationStatus[selectedWasher.id] : undefined;
  const dot1Opacity = pendingAnim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [0.2, 1, 0.2, 0.2],
  });
  const dot2Opacity = pendingAnim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [0.2, 0.2, 1, 0.2],
  });
  const dot3Opacity = pendingAnim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [0.2, 0.2, 0.2, 1],
  });
  const ringOpacity = pulseAnim.interpolate({
    inputRange: [1, 1.15],
    outputRange: [0.35, 0],
  });
  const ringScaleLarge = pulseAnim.interpolate({
    inputRange: [1, 1.15],
    outputRange: [1.2, 1.9],
  });

  const handleConfirmWasher = () => {
    if (!selectedWasher) return;
    if (selectedStatus !== 'confirmed') {
      Alert.alert(
        'En attente de confirmation',
        'Le laveur doit confirmer la demande avant de partager son heure d\'arrivee.'
      );
      return;
    }
    const bookingId = `bk-${Date.now()}`;
    router.push({
      pathname: '/booking/tracking',
      params: {
        bookingId,
        washerId: selectedWasher.id.toString(),
        washerName: selectedWasher.name,
        washerFirstName: selectedWasher.firstName,
        washerPhone: selectedWasher.phoneNumber,
        washerRating: selectedWasher.rating.toString(),
        washerReviews: selectedWasher.reviews.toString(),
        arrivalTime: selectedWasher.time.toString(),
        address: booking.location,
        vehicle: booking.vehicle,
        washType: booking.washType,
        price: booking.price.toString(),
        latitude: userLocation?.latitude?.toString() || paramLatitude,
        longitude: userLocation?.longitude?.toString() || paramLongitude,
        scheduledAt: booking.scheduledAt,
      },
    });
  };

  const handleCancel = () => {
    Alert.alert('Annuler la recherche', 'Voulez-vous annuler la recherche ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  };

  const handleSelectWasher = (washer: any) => {
    setSelectedWasher(washer);
    setConfirmationStatus((prev) => ({ ...prev, [washer.id]: 'pending' }));
    const existingTimer = confirmationTimers.current[washer.id];
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    confirmationTimers.current[washer.id] = setTimeout(() => {
      setConfirmationStatus((prev) => ({ ...prev, [washer.id]: 'confirmed' }));
    }, 1800 + washer.id * 400);
  };

  useEffect(() => {
    return () => {
      Object.values(confirmationTimers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Recherche de laveur</Text>
          <Text style={styles.subtitle}>{currentPhase.label}</Text>
        </View>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <X size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapSection}>
        {mapRegion ? (
          <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={mapRegion}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
          >
            {(userLocation || mapRegion) && (
              <Marker coordinate={userLocation || mapRegion} title="Vous">
                <View style={styles.mapPin}>
                  <MapPin size={16} color="#FFFFFF" />
                </View>
              </Marker>
            )}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#4A6FFF" />
            <Text style={styles.placeholderText}>Chargement de la carte...</Text>
          </View>
        )}
        <View style={styles.mapOverlay} pointerEvents="none">
          <View style={styles.addressPill}>
            <Text style={styles.addressPillText} numberOfLines={1}>
              {booking.location}
            </Text>
          </View>
          <View style={styles.pulseCenter}>
            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ scale: pulseAnim }], opacity: ringOpacity },
              ]}
            />
            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ scale: ringScaleLarge }], opacity: ringOpacity },
              ]}
            />
            <View style={styles.pulseCore} />
          </View>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <MapPin size={16} color="#4A6FFF" />
          <Text style={styles.summaryText} numberOfLines={1}>{booking.location}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryMeta}>{booking.vehicle}</Text>
          <Text style={styles.summaryMeta}>{booking.washType}</Text>
          <Text style={styles.summaryPrice}>{booking.price.toLocaleString()} F CFA</Text>
        </View>
        {booking.scheduledAt ? (
          <Text style={styles.scheduleText}>{booking.scheduledAt}</Text>
        ) : null}
      </View>

      <View style={styles.progressCard}>
        <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.pulseInner} />
        </Animated.View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>{currentPhase.label}</Text>
          <Text style={styles.progressSubtitle}>Nous trouvons le meilleur laveur pour vous.</Text>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
              ]}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.mapButton} onPress={() => setShowMap(true)}>
          <Navigation size={18} color="#4A6FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <Text style={styles.sectionTitle}>Laveurs disponibles</Text>
        {washers.length === 0 ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#4A6FFF" />
            <Text style={styles.emptyText}>Recherche en cours...</Text>
          </View>
        ) : (
          washers.map((washer) => {
            const isSelected = selectedWasher?.id === washer.id;
            const status = confirmationStatus[washer.id];
            const showEta = status === 'confirmed';
            return (
              <TouchableOpacity
                key={washer.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleSelectWasher(washer)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.avatar, { backgroundColor: washer.color }]}>
                    <Text style={styles.avatarText}>{getInitials(washer.name)}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.washerName}>{washer.name}</Text>
                    <View style={styles.ratingRow}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingText}>{washer.rating.toFixed(1)}</Text>
                      <Text style={styles.reviewText}>({washer.reviews} avis)</Text>
                    </View>
                    <View style={styles.badgesRow}>
                      {washer.badges.map((badge: string) => (
                        <View key={badge} style={styles.badge}>
                          <Text style={styles.badgeText}>{badge}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.cardMeta}>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaText}>{washer.distance} km</Text>
                    </View>
                    <View style={styles.metaChipAlt}>
                      <Clock size={12} color="#111827" />
                      <Text style={styles.metaText}>
                        {showEta ? `${washer.time} min` : isSelected ? 'En attente' : 'ETA apres confirmation'}
                      </Text>
                    </View>
                  </View>
                </View>
                {isSelected ? (
                  <View style={styles.selectedHint}>
                    <CheckCircle size={16} color="#4A6FFF" />
                    <Text style={styles.selectedText}>
                      {status === 'confirmed' ? 'Confirme' : 'En attente de confirmation'}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        {selectedWasher && selectedStatus === 'pending' ? (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingText}>Demande envoyee au laveur</Text>
            <View style={styles.pendingDots}>
              <Animated.View style={[styles.pendingDot, { opacity: dot1Opacity }]} />
              <Animated.View style={[styles.pendingDot, { opacity: dot2Opacity }]} />
              <Animated.View style={[styles.pendingDot, { opacity: dot3Opacity }]} />
            </View>
          </View>
        ) : null}
        <View style={styles.securityNote}>
          <ShieldCheck size={16} color="#22C55E" />
          <Text style={styles.securityText}>Paiement securise � Assurance incluse</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            (!selectedWasher || selectedStatus !== 'confirmed') && styles.primaryButtonDisabled,
          ]}
          onPress={handleConfirmWasher}
          disabled={!selectedWasher || selectedStatus !== 'confirmed'}
        >
          <Text style={styles.primaryButtonText}>
            {selectedWasher
              ? selectedStatus === 'confirmed'
                ? `Confirmer ${selectedWasher.firstName}`
                : 'En attente de confirmation'
              : 'Choisir un laveur'}
          </Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)}>
        <SafeAreaView style={styles.mapScreen}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Carte des laveurs</Text>
            <TouchableOpacity style={styles.mapClose} onPress={() => setShowMap(false)}>
              <X size={18} color="#111827" />
            </TouchableOpacity>
          </View>
          {mapRegion ? (
            <MapView
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={mapRegion}
              showsUserLocation
              showsMyLocationButton={false}
              showsCompass={false}
            >
              {userLocation && (
                <Marker coordinate={userLocation} title="Vous">
                  <View style={styles.userMarker}>
                    <MapPin size={14} color="#4A6FFF" />
                  </View>
                </Marker>
              )}
              {washers.map((washer) => (
                <Marker
                  key={washer.id}
                  coordinate={{ latitude: washer.latitude, longitude: washer.longitude }}
                  title={washer.name}
                  onPress={() => handleSelectWasher(washer)}
                >
                  <View style={[styles.washerMarker, { backgroundColor: washer.color }]}>
                    <Text style={styles.markerInitials}>{getInitials(washer.name)}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color="#4A6FFF" />
              <Text style={styles.placeholderText}>Chargement de la carte...</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => mapRegion && setMapRegion({ ...mapRegion })}
          >
            <Locate size={18} color="#4A6FFF" />
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    gap: 8,
  },
  mapSection: {
    height: 240,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  addressPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    maxWidth: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  addressPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  pulseCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#4A6FFF',
    backgroundColor: 'rgba(74, 111, 255, 0.08)',
  },
  pulseCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A6FFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mapPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A6FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  summaryMeta: {
    fontSize: 12,
    color: '#4B5563',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  summaryPrice: {
    marginLeft: 'auto',
    fontSize: 13,
    fontWeight: '700',
    color: '#4A6FFF',
  },
  scheduleText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressCard: {
    marginTop: 14,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  pulseDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A6FFF',
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  progressSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#EEF2F7',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A6FFF',
  },
  mapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
  },
  card: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: '#4A6FFF',
    backgroundColor: '#F5F7FF',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
  },
  washerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  reviewText: {
    fontSize: 11,
    color: '#6B7280',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#ECFDF3',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#22C55E',
  },
  cardMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  metaChip: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaChipAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  selectedHint: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A6FFF',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },
  pendingBanner: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginBottom: 10,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A6FFF',
  },
  pendingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A6FFF',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4A6FFF',
    borderRadius: 14,
    paddingVertical: 14,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  map: {
    flex: 1,
  },
  mapHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  mapClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 12,
    color: '#6B7280',
  },
  userMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A6FFF',
  },
  washerMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerInitials: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centerButton: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});

