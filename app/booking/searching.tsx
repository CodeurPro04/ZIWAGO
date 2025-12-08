import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { 
  X, 
  MapPin, 
  Car, 
  Wallet, 
  BookmarkPlus, 
  Navigation,
  Clock,
  Shield,
  CheckCircle,
  Star
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function SearchingScreen() {
  const router = useRouter();
  const [timer, setTimer] = useState(0);
  const [isFound, setIsFound] = useState(false);
  const [washers, setWashers] = useState([]);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const washPrices = {
    exterior: 2000,
    interior: 2500,
    complete: 4000,
  };

  const washTitles = {
    exterior: 'Extérieur uniquement',
    interior: 'Intérieur uniquement',
    complete: 'Lavage complet',
  };

  // Simulation de données de laveurs
  const mockWashers = [
    {
      id: 1,
      name: 'Jean Koffi',
      rating: 4.8,
      distance: '0.8 km',
      time: '5-10 min',
      avatar: '👨🏾',
      color: '#4A90E2',
      latitude: 5.3480,
      longitude: -4.0210,
    },
    {
      id: 2,
      name: 'Marie Koné',
      rating: 4.9,
      distance: '1.2 km',
      time: '8-12 min',
      avatar: '👩🏾',
      color: '#E74C3C',
      latitude: 5.3465,
      longitude: -4.0225,
    },
    {
      id: 3,
      name: 'Paul Kouadio',
      rating: 4.7,
      distance: '0.5 km',
      time: '3-7 min',
      avatar: '🧔🏾',
      color: '#2ECC71',
      latitude: 5.3472,
      longitude: -4.0208,
    },
  ];

  // Animation de pulsation
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Animation d'entrée
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();

    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      delay: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      delay: 400,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();

    // Timer
    const timerInterval = setInterval(() => {
      setTimer((prev) => {
        if (prev >= 30) {
          clearInterval(timerInterval);
          findWashers();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    // Barre de progression
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 30000, // 30 secondes
      useNativeDriver: false,
    }).start();

    return () => {
      pulseAnimation.stop();
      clearInterval(timerInterval);
    };
  }, []);

  const findWashers = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsFound(true);
    setWashers(mockWashers);
    
    // Animation de confirmation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const selectWasher = (washer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Naviguer vers l'écran de confirmation
    setTimeout(() => router.replace('/(tabs)'), 500);
  };

  const cancelRequest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const region = {
    latitude: 5.3475,
    longitude: -4.0215,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={cancelRequest}
        >
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recherche en cours</Text>
        <View style={styles.timerBadge}>
          <Clock size={12} color="#FFFFFF" />
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
      </View>

      {/* Carte */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
        >
          {/* Cercle de recherche */}
          <Circle
            center={region}
            radius={500} // 500m de rayon
            strokeWidth={2}
            strokeColor="rgba(74, 144, 226, 0.5)"
            fillColor="rgba(74, 144, 226, 0.1)"
          />

          {/* Marqueur position actuelle */}
          <Marker
            coordinate={region}
            title="Votre position"
          >
            <Animated.View style={[styles.userMarker, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.userMarkerInner}>
                <MapPin size={20} color="#FFFFFF" />
              </View>
            </Animated.View>
          </Marker>

          {/* Marqueurs des laveurs */}
          {washers.map((washer) => (
            <Marker
              key={washer.id}
              coordinate={{
                latitude: washer.latitude,
                longitude: washer.longitude,
              }}
              title={washer.name}
              onPress={() => selectWasher(washer)}
            >
              <View style={[styles.washerMarker, { backgroundColor: washer.color }]}>
                <Text style={styles.washerMarkerText}>{washer.avatar}</Text>
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Indicateur de recherche */}
        <View style={styles.searchIndicator}>
          <Animated.View 
            style={[
              styles.searchPulse,
              { transform: [{ scale: pulseAnim }] }
            ]}
          />
          <View style={styles.searchCenter}>
            <Navigation size={20} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* Carte de recherche (glissante) */}
      <Animated.View 
        style={[
          styles.searchCard,
          { 
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
            opacity: fadeAnim
          }
        ]}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Titre de recherche */}
          <View style={styles.searchingSection}>
            <Animated.View style={[styles.loadingDots]}>
              {[0, 1, 2].map((dot) => (
                <Animated.View
                  key={dot}
                  style={[
                    styles.dot,
                    {
                      transform: [
                        {
                          scale: pulseAnim.interpolate({
                            inputRange: [1, 1.3],
                            outputRange: [1, 1.2],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </Animated.View>
            <Text style={styles.searchingTitle}>
              Recherche d'un laveur à proximité...
            </Text>
            <Text style={styles.searchingSubtitle}>
              Nous cherchons le meilleur laveur près de vous
            </Text>
          </View>

          {/* Barre de progression */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>Recherche en cours...</Text>
          </View>

          {/* Section enregistrement d'emplacement */}
          <View style={styles.saveLocationCard}>
            <View style={styles.saveIconContainer}>
              <BookmarkPlus size={24} color={Colors.primary} />
            </View>
            <View style={styles.saveTextContainer}>
              <Text style={styles.saveTitle}>
                Enregistrez l'emplacement de votre voiture
              </Text>
              <Text style={styles.saveSubtitle}>
                Pour un accès rapide lors de vos prochaines demandes
              </Text>
            </View>
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>

          {/* Section détails de la demande */}
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Détails de votre demande</Text>
            
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={styles.locationTitle}>Riviera 2 - Carrefour Duncan</Text>
              </View>
              <View style={styles.locationTags}>
                {['Riviera 2', 'Carrefour Duncan', 'Rue D43'].map((tag, index) => (
                  <View key={index} style={styles.locationTag}>
                    <Text style={styles.locationTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleIcon}>
                <Car size={20} color={Colors.primary} />
              </View>
              <View style={styles.vehicleDetails}>
                <Text style={styles.vehicleType}>Berline</Text>
                <Text style={styles.vehicleSubtitle}>Voiture moyenne</Text>
              </View>
              <View style={styles.priceBadge}>
                <Wallet size={16} color="#FFFFFF" />
                <Text style={styles.priceText}>2 000 F CFA</Text>
              </View>
            </View>

            {/* Liste des laveurs trouvés */}
            {isFound && (
              <View style={styles.washersFound}>
                <View style={styles.foundHeader}>
                  <CheckCircle size={20} color="#2ECC71" />
                  <Text style={styles.foundTitle}>Laveurs disponibles</Text>
                </View>
                
                {washers.map((washer) => (
                  <TouchableOpacity
                    key={washer.id}
                    style={styles.washerCard}
                    onPress={() => selectWasher(washer)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.washerAvatar}>
                      <Text style={styles.washerAvatarText}>{washer.avatar}</Text>
                    </View>
                    <View style={styles.washerInfo}>
                      <Text style={styles.washerName}>{washer.name}</Text>
                      <View style={styles.washerStats}>
                        <View style={styles.washerStat}>
                          <Star size={12} color="#FFD700" />
                          <Text style={styles.washerStatText}>{washer.rating}</Text>
                        </View>
                        <Text style={styles.washerStatText}>•</Text>
                        <Text style={styles.washerStatText}>{washer.distance}</Text>
                        <Text style={styles.washerStatText}>•</Text>
                        <Text style={styles.washerStatText}>{washer.time}</Text>
                      </View>
                    </View>
                    <View style={styles.washerAction}>
                      <Text style={styles.washerActionText}>Sélectionner</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Bouton annuler */}
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={cancelRequest}
          >
            <Text style={styles.cancelButtonText}>Annuler la demande</Text>
          </TouchableOpacity>

          {/* Sécurité */}
          <View style={styles.securityBadge}>
            <Shield size={16} color="#2ECC71" />
            <Text style={styles.securityText}>
              Transaction 100% sécurisée • Données cryptées
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    gap: Spacing.xs,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
  },
  searchPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
  },
  searchCenter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  washerMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  washerMarkerText: {
    fontSize: 20,
  },
  searchCard: {
    position: 'absolute',
    bottom: 0,
    left: Spacing.lg,
    right: Spacing.lg,
    maxHeight: height * 0.7,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingVertical: Spacing.lg,
  },
  searchingSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  searchingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  searchingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  saveLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E8F0FF',
    marginBottom: Spacing.lg,
  },
  saveIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  saveTextContainer: {
    flex: 1,
  },
  saveTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  saveSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  saveButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  locationCard: {
    backgroundColor: '#F8FAFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  locationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  locationTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  locationTagText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  vehicleSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  washersFound: {
    marginTop: Spacing.lg,
  },
  foundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  foundTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  washerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  washerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  washerAvatarText: {
    fontSize: 20,
  },
  washerInfo: {
    flex: 1,
  },
  washerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  washerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  washerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  washerStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  washerAction: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  washerActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FFE8E8',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
  securityBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  securityText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});