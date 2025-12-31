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
  Dimensions,
  Modal,
  Alert,
  Linking
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  X, 
  MapPin, 
  Car, 
  Wallet, 
  Clock,
  Shield,
  CheckCircle,
  Star,
  Sparkles,
  ChevronRight,
  User,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Heart,
  Map as MapIcon,
  Navigation,
  Award,
  Locate,
  Target,
  Battery,
  Truck,
  Package,
  RotateCcw,
  Play,
  Pause,
  Home,
  Sparkle,
  BatteryCharging,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Timer,
  Navigation2,
  Car as CarIcon,
  List
} from 'lucide-react-native';

// Configuration Mapbox pour la recherche (Web API uniquement)
const MAPBOX_TOKEN = 'pk.eyJ1IjoiY29kZXVycHJvMDQiLCJhIjoiY21jY2w4MW4zMDkxODJqcXNydWZkenBjYSJ9.d0SfKBeHypUYmQfJXjlR1Q';

const { width, height } = Dimensions.get('window');
const SEARCH_DURATION = 15;

// Importez les données MOCK_WASHERS et FALLBACK_IMAGE de votre code existant
const MOCK_WASHERS = [
  {
    id: 1,
    name: 'Jean K.',
    firstName: 'Jean',
    rating: 4.9,
    reviews: 247,
    distance: 0.8,
    time: 8,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    color: '#4A6FFF',
    latitude: 5.3482,
    longitude: -4.0212,
    badges: ['TOP', 'PRO'],
    experience: '3 ans',
    washCount: 512,
    responseRate: 98,
    status: 'available',
    description: 'Spécialiste intérieur',
    isFavorite: true,
    isPremium: true,
    phoneNumber: '+225 07 07 07 07 07',
    vehicle: {
      model: 'Toyota Hilux',
      plate: 'AB-123-CD',
      color: 'Blanc'
    },
    equipment: ['Aspirateur professionnel', 'Shampooing écologique', 'Chiffons microfibres'],
    currentLocation: {
      latitude: 5.3552,
      longitude: -4.0282
    }
  },
  {
    id: 2,
    name: 'Marie K.',
    firstName: 'Marie',
    rating: 4.8,
    reviews: 189,
    distance: 1.2,
    time: 12,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    color: '#FF6B8B',
    latitude: 5.3463,
    longitude: -4.0228,
    badges: ['RAPIDE'],
    experience: '2 ans',
    washCount: 347,
    responseRate: 95,
    status: 'available',
    description: 'Expert carrosserie',
    isFavorite: false,
    isPremium: true,
    phoneNumber: '+225 07 77 77 77 77',
    vehicle: {
      model: 'Ford Ranger',
      plate: 'EF-456-GH',
      color: 'Noir'
    },
    equipment: ['Karcher professionnel', 'Cire protectrice', 'Brosses douces'],
    currentLocation: {
      latitude: 5.3562,
      longitude: -4.0292
    }
  },
  {
    id: 3,
    name: 'Paul A.',
    firstName: 'Paul',
    rating: 4.7,
    reviews: 132,
    distance: 0.5,
    time: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    color: '#2ECC71',
    latitude: 5.3475,
    longitude: -4.0205,
    badges: ['ECO'],
    experience: '1 an',
    washCount: 198,
    responseRate: 92,
    status: 'available',
    description: 'Détail complet',
    isFavorite: true,
    isPremium: false,
    phoneNumber: '+225 01 23 45 67 89',
    vehicle: {
      model: 'Renault Kangoo',
      plate: 'IJ-789-KL',
      color: 'Bleu'
    },
    equipment: ['Produits écologiques', 'Système eau osmosée', 'Aspirateur puissant'],
    currentLocation: {
      latitude: 5.3490,
      longitude: -4.0220
    }
  },
  {
    id: 4,
    name: 'Fatou D.',
    firstName: 'Fatou',
    rating: 4.6,
    reviews: 98,
    distance: 1.5,
    time: 15,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    color: '#9B59B6',
    latitude: 5.3458,
    longitude: -4.0235,
    badges: ['NEW'],
    experience: '6 mois',
    washCount: 87,
    responseRate: 88,
    status: 'available',
    description: 'Nettoyage écologique',
    isFavorite: false,
    isPremium: false,
    phoneNumber: '+225 09 87 65 43 21',
    vehicle: {
      model: 'Peugeot Partner',
      plate: 'MN-012-OP',
      color: 'Gris'
    },
    equipment: ['Kit complet mobile', 'Nettoyants bio', 'Sèche-cheveux professionnel'],
    currentLocation: {
      latitude: 5.3540,
      longitude: -4.0260
    }
  }
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop';

// Écran de recherche des laveurs (votre code existant)
export default function ModernSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Récupération des données de l'écran précédent
  const { 
    address: paramAddress = 'Riviera 2, Carrefour Duncan',
    latitude: paramLatitude = '5.3482',
    longitude: paramLongitude = '-4.0212',
    vehicle: paramVehicle = 'Berline',
    washType: paramWashType = 'Extérieur',
    price: paramPrice = '2000'
  } = params;

  const [timer, setTimer] = useState(0);
  const [searchPhase, setSearchPhase] = useState('searching');
  const [washers, setWashers] = useState([]);
  const [selectedWasher, setSelectedWasher] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [mapRegion, setMapRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Données de réservation provenant de l'écran précédent
  const [bookingData, setBookingData] = useState({
    location: decodeURIComponent(paramAddress),
    vehicle: decodeURIComponent(paramVehicle),
    washType: decodeURIComponent(paramWashType),
    price: parseInt(paramPrice)
  });

  // Référence pour la map
  const mapRef = useRef(null);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const searchIconAnim = useRef(new Animated.Value(0)).current;
  const washerCardsAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim1 = useRef(new Animated.Value(0)).current;
  const rippleAnim2 = useRef(new Animated.Value(0)).current;
  const rippleAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
    simulateSearch();
    getUserLocation();
    
    return () => {};
  }, []);

  // Récupérer la localisation exacte de l'utilisateur
  const getUserLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // Si nous avons des coordonnées passées en paramètres, les utiliser
      const lat = parseFloat(paramLatitude);
      const lng = parseFloat(paramLongitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        const coords = { latitude: lat, longitude: lng };
        setUserLocation(coords);
        setMapRegion({
          ...coords,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } else {
        // Sinon, utiliser la localisation du téléphone
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
          });
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(coords);
          setMapRegion({
            ...coords,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          
          // Mettre à jour l'adresse si elle n'est pas déjà définie
          if (bookingData.location === 'Riviera 2, Carrefour Duncan') {
            try {
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json?access_token=${MAPBOX_TOKEN}&types=address`
              );
              const data = await response.json();
              if (data.features[0]?.place_name) {
                setBookingData(prev => ({
                  ...prev,
                  location: data.features[0].place_name
                }));
              }
            } catch (error) {
              console.log('Erreur géocodage:', error);
            }
          }
        }
      }
    } catch (error) {
      console.log('Erreur de localisation:', error);
      // Coordonnées par défaut
      const defaultCoords = {
        latitude: 5.3482,
        longitude: -4.0212,
      };
      setUserLocation(defaultCoords);
      setMapRegion({
        ...defaultCoords,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const startAnimations = () => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Search icon rotation
    Animated.loop(
      Animated.timing(searchIconAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Ripple animations avec délais
    [rippleAnim1, rippleAnim2, rippleAnim3].forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 600),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Fade in
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const simulateSearch = () => {
    const phases = [
      { phase: 'searching', duration: 4000, count: 0 },
      { phase: 'analyzing', duration: 3000, count: 2 },
      { phase: 'connecting', duration: 2500, count: 3 },
      { phase: 'found', duration: 0, count: 4 }
    ];

    let elapsed = 0;
    phases.forEach((p, index) => {
      setTimeout(() => {
        setSearchPhase(p.phase);
        setWashers(MOCK_WASHERS.slice(0, p.count));
        
        const progress = ((index + 1) / phases.length);
        Animated.timing(progressAnim, {
          toValue: progress,
          duration: p.duration,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }).start();

        if (p.phase === 'found') {
          setWashers(MOCK_WASHERS);
          Animated.spring(washerCardsAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      }, elapsed);
      elapsed += p.duration;
    });

    // Timer
    const interval = setInterval(() => {
      setTimer(t => {
        if (t >= SEARCH_DURATION) {
          clearInterval(interval);
          return t;
        }
        return t + 1;
      });
    }, 1000);
  };

  const handleSelectWasher = (washer) => {
    setSelectedWasher(washer);
    
    // Si on ouvre la map, centrer sur le laveur sélectionné
    if (showMap && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: washer.latitude,
        longitude: washer.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handleConfirmWasher = () => {
    if (selectedWasher) {
      Alert.alert(
        'Laveur confirmé',
        `${selectedWasher.name} arrivera dans ${selectedWasher.time} minutes`,
        [
          { 
            text: 'OK',
            onPress: () => {
              // Navigation vers l'écran de suivi de commande
              router.push({
                pathname: '/booking/tracking',
                params: {
                  washerId: selectedWasher.id.toString(),
                  washerName: selectedWasher.name,
                  washerFirstName: selectedWasher.firstName,
                  washerPhone: selectedWasher.phoneNumber,
                  washerAvatar: selectedWasher.avatar,
                  washerRating: selectedWasher.rating.toString(),
                  washerReviews: selectedWasher.reviews.toString(),
                  arrivalTime: selectedWasher.time.toString(),
                  address: bookingData.location,
                  vehicle: bookingData.vehicle,
                  washType: bookingData.washType,
                  price: bookingData.price.toString(),
                  latitude: userLocation?.latitude?.toString() || paramLatitude,
                  longitude: userLocation?.longitude?.toString() || paramLongitude
                }
              });
            }
          }
        ]
      );
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler la recherche',
      'Voulez-vous vraiment annuler cette recherche ?',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui', 
          style: 'destructive', 
          onPress: () => router.back()
        }
      ]
    );
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const getAvatarSource = (washer) => {
    return { uri: imageErrors[washer.id] ? FALLBACK_IMAGE : washer.avatar };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const centerMap = () => {
    if (mapRef.current && selectedWasher) {
      mapRef.current.animateToRegion({
        latitude: selectedWasher.latitude,
        longitude: selectedWasher.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    } else if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const renderMapScreen = () => (
    <SafeAreaView style={styles.mapContainer}>
      <View style={styles.mapHeader}>
        <Text style={styles.mapTitle}>Carte des laveurs</Text>
        <TouchableOpacity 
          style={styles.closeMapButton}
          onPress={() => setShowMap(false)}
        >
          <X size={24} color="#1D1D1F" />
        </TouchableOpacity>
      </View>
      
      {isLoadingLocation || !mapRegion ? (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>Chargement de la carte...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
        >
          {/* Marqueur utilisateur */}
          {userLocation && (
            <Marker
              coordinate={userLocation}
              title="Votre position"
              description={bookingData.location}
            >
              <View style={styles.userMarker}>
                <MapPin size={24} color="#4A6FFF" />
              </View>
            </Marker>
          )}
          
          {/* Marqueurs des laveurs */}
          {washers.map((washer) => {
            const isSelected = selectedWasher?.id === washer.id;
            return (
              <Marker
                key={washer.id}
                coordinate={{
                  latitude: washer.latitude,
                  longitude: washer.longitude,
                }}
                title={washer.name}
                description={`${washer.distance} km • ${washer.time} min`}
                onPress={() => handleSelectWasher(washer)}
              >
                <View style={[
                  styles.markerContainer,
                  isSelected && styles.markerContainerSelected,
                  { backgroundColor: washer.color }
                ]}>
                  <Image 
                    source={getAvatarSource(washer)}
                    style={styles.markerImage}
                  />
                  {washer.isPremium && (
                    <View style={styles.markerPremium}>
                      <Star size={10} color="#FFD700" />
                    </View>
                  )}
                </View>
              </Marker>
            );
          })}
        </MapView>
      )}

      {/* Bouton de centrage */}
      <TouchableOpacity
        style={styles.centerMapButton}
        onPress={centerMap}
      >
        <Locate size={24} color="#4A6FFF" />
      </TouchableOpacity>

      <View style={styles.mapBottomSheet}>
        <Text style={styles.bottomSheetTitle}>Laveurs à proximité</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.washersScroll}
        >
          {washers.map((washer) => (
            <TouchableOpacity
              key={washer.id}
              style={[
                styles.washerMapCard,
                selectedWasher?.id === washer.id && styles.washerMapCardSelected
              ]}
              onPress={() => handleSelectWasher(washer)}
            >
              <Image 
                source={getAvatarSource(washer)}
                style={styles.washerMapAvatar}
              />
              <Text style={styles.washerMapName}>{washer.firstName}</Text>
              <View style={styles.washerMapRating}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.washerMapRatingText}>{washer.rating}</Text>
              </View>
              <Text style={styles.washerMapDistance}>{washer.distance} km</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {selectedWasher && (
          <TouchableOpacity 
            style={styles.confirmMapButton}
            onPress={handleConfirmWasher}
          >
            <Text style={styles.confirmMapButtonText}>Choisir {selectedWasher.firstName}</Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );

  const renderSearchingState = () => (
    <Animated.View style={[styles.searchingContainer, { opacity: fadeInAnim }]}>
      <View style={styles.rippleContainer}>
        {[rippleAnim1, rippleAnim2, rippleAnim3].map((anim, index) => (
          <Animated.View 
            key={index}
            style={[
              styles.ripple,
              {
                transform: [{
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 2]
                  })
                }],
                opacity: anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.8, 0]
                })
              }
            ]}
          />
        ))}
        
        <Animated.View 
          style={[
            styles.searchIcon,
            {
              transform: [
                { scale: pulseAnim },
                {
                  rotate: searchIconAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }
              ]
            }
          ]}
        >
          <Sparkles size={40} color="#FFFFFF" />
        </Animated.View>
      </View>

      <Text style={styles.searchTitle}>
        {searchPhase === 'searching' && 'Recherche en cours...'}
        {searchPhase === 'analyzing' && 'Analyse des profils...'}
        {searchPhase === 'connecting' && 'Connexion...'}
        {searchPhase === 'found' && 'Laveurs trouvés !'}
      </Text>
      
      <Text style={styles.searchSubtitle}>
        {washers.length > 0 
          ? `${washers.length} laveur${washers.length > 1 ? 's' : ''} trouvé${washers.length > 1 ? 's' : ''}`
          : `Recherche autour de ${bookingData.location}`
        }
      </Text>

      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />
      </View>
    </Animated.View>
  );

  const renderWasherCard = (washer, index) => {
    const isSelected = selectedWasher?.id === washer.id;
    const cardScale = washerCardsAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1]
    });

    return (
      <Animated.View
        key={washer.id}
        style={[
          styles.washerCard,
          {
            opacity: washerCardsAnim,
            transform: [
              { scale: cardScale },
              {
                translateY: washerCardsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.cardContent,
            isSelected && styles.cardContentSelected
          ]}
          onPress={() => handleSelectWasher(washer)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <Image 
                source={getAvatarSource(washer)}
                style={styles.avatar}
                onError={() => handleImageError(washer.id)}
              />
              {washer.isFavorite && (
                <View style={styles.favoriteIcon}>
                  <Heart size={12} color="#FFFFFF" fill="#FF6B8B" />
                </View>
              )}
              {washer.isPremium && (
                <View style={styles.premiumIcon}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                </View>
              )}
            </View>

            <View style={styles.washerMainInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.washerName}>{washer.name}</Text>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <CheckCircle size={16} color="#4A6FFF" fill="#4A6FFF" />
                  </View>
                )}
              </View>
              
              <View style={styles.ratingRow}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.rating}>{washer.rating}</Text>
                <Text style={styles.reviews}>({washer.reviews})</Text>
              </View>

              <Text style={styles.description}>{washer.description}</Text>
            </View>

            <View style={styles.cardRight}>
              <View style={styles.distanceTag}>
                <Text style={styles.distance}>{washer.distance} km</Text>
              </View>
              <View style={styles.timeTag}>
                <Clock size={12} color="#4A6FFF" />
                <Text style={styles.time}>{washer.time} min</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.badges}>
              {washer.badges.map((badge, idx) => (
                <View key={idx} style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))}
            </View>
            <View style={styles.stats}>
              <Text style={styles.stat}>{washer.experience}</Text>
              <View style={styles.dot} />
              <Text style={styles.stat}>{washer.washCount} lavages</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFoundState = () => (
    <ScrollView 
      style={styles.washersContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.washersContent}
    >
      <View style={styles.washersHeader}>
        <View>
          <Text style={styles.washersTitle}>Laveurs disponibles</Text>
          <Text style={styles.washersSubtitle}>{washers.length} professionnels près de chez vous</Text>
        </View>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => setShowMap(true)}
        >
          <MapIcon size={20} color="#4A6FFF" />
        </TouchableOpacity>
      </View>

      {washers.map(renderWasherCard)}

      <View style={styles.securityNote}>
        <Shield size={16} color="#2ECC71" />
        <Text style={styles.securityText}>Tous nos laveurs sont vérifiés et assurés</Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
          <X size={24} color="#1D1D1F" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {searchPhase === 'found' ? 'Choisir un laveur' : 'Recherche'}
          </Text>
          <Text style={styles.headerSubtitle}>{bookingData.location}</Text>
        </View>

        <View style={styles.timerBadge}>
          <Clock size={14} color="#4A6FFF" />
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
      </View>

      {/* Booking Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Car size={18} color="#4A6FFF" />
          <Text style={styles.summaryText}>{bookingData.vehicle} • {bookingData.washType}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Wallet size={18} color="#4A6FFF" />
          <Text style={styles.summaryPrice}>{bookingData.price.toLocaleString()} FCFA</Text>
        </View>
      </View>

      {/* Main Content */}
      {searchPhase === 'found' ? renderFoundState() : renderSearchingState()}

      {/* Confirm Button */}
      {selectedWasher && (
        <Animated.View 
          style={[
            styles.confirmContainer,
            {
              transform: [{
                translateY: washerCardsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.confirmContent}>
            <Image 
              source={getAvatarSource(selectedWasher)}
              style={styles.confirmAvatar}
              onError={() => handleImageError(selectedWasher.id)}
            />
            <View style={styles.confirmInfo}>
              <Text style={styles.confirmName}>{selectedWasher.name}</Text>
              <Text style={styles.confirmTime}>Arrive dans {selectedWasher.time} min</Text>
            </View>
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirmWasher}
            >
              <Text style={styles.confirmButtonText}>Confirmer</Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Map Modal */}
      <Modal
        visible={showMap}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowMap(false)}
      >
        {renderMapScreen()}
      </Modal>
    </SafeAreaView>
  );
}

// Écran de suivi de commande (la suite)
export function OrderTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Récupération des données depuis l'écran précédent
  const {
    washerId = '1',
    washerName = 'Jean K.',
    washerFirstName = 'Jean',
    washerPhone = '+225 07 07 07 07 07',
    washerAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    washerRating = '4.9',
    washerReviews = '247',
    arrivalTime = '8',
    address = 'Riviera 2, Carrefour Duncan',
    vehicle = 'Berline',
    washType = 'Extérieur',
    price = '2000',
    latitude = '5.3482',
    longitude = '-4.0212'
  } = params;

  const [simulationPhase, setSimulationPhase] = useState('preparing');
  const [arrivalMinutes, setArrivalMinutes] = useState(parseInt(arrivalTime));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [washerLocation, setWasherLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isMapView, setIsMapView] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const washerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(0)).current;
  const timerAnim = useRef(new Animated.Value(0)).current;
  
  // Références
  const mapRef = useRef(null);
  const animationRef = useRef(null);
  const timerRef = useRef(null);

  // Données du laveur
  const [washer] = useState(() => {
    const foundWasher = MOCK_WASHERS.find(w => w.id.toString() === washerId) || MOCK_WASHERS[0];
    return {
      ...foundWasher,
      name: washerName,
      firstName: washerFirstName,
      phoneNumber: washerPhone,
      avatar: washerAvatar,
      rating: parseFloat(washerRating),
      reviews: parseInt(washerReviews),
      time: parseInt(arrivalTime)
    };
  });

  const [bookingData] = useState({
    location: decodeURIComponent(address),
    vehicle: decodeURIComponent(vehicle),
    washType: decodeURIComponent(washType),
    price: parseInt(price)
  });

  // Coordonnées du trajet (simulé)
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    initializeSimulation();
    startAnimations();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  const initializeSimulation = async () => {
    try {
      // Récupérer la localisation de l'utilisateur
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(userCoords);
        
        // Position initiale du laveur (à 2km de distance)
        const washerStartCoords = {
          latitude: userCoords.latitude + 0.018,
          longitude: userCoords.longitude - 0.018,
        };
        
        // Point intermédiaire
        const intermediateCoords = {
          latitude: userCoords.latitude + 0.009,
          longitude: userCoords.longitude - 0.009,
        };
        
        setWasherLocation(washerStartCoords);
        setRouteCoordinates([washerStartCoords, intermediateCoords, userCoords]);
      }
    } catch (error) {
      console.log('Erreur de localisation:', error);
      // Utiliser les coordonnées par défaut
      const defaultUserCoords = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
      const defaultWasherCoords = {
        latitude: defaultUserCoords.latitude + 0.018,
        longitude: defaultUserCoords.longitude - 0.018,
      };
      const intermediateCoords = {
        latitude: defaultUserCoords.latitude + 0.009,
        longitude: defaultUserCoords.longitude - 0.009,
      };
      
      setUserLocation(defaultUserCoords);
      setWasherLocation(defaultWasherCoords);
      setRouteCoordinates([defaultWasherCoords, intermediateCoords, defaultUserCoords]);
    }
    
    // Démarrer la simulation après un court délai
    setTimeout(() => {
      setSimulationPhase('preparing');
      setTimeout(() => {
        setSimulationPhase('traveling');
        startTravelSimulation();
      }, 3000);
    }, 1000);
  };

  const startAnimations = () => {
    // Animation de pulsation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Slide up
    Animated.spring(slideUpAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const startTravelSimulation = () => {
    const totalPoints = routeCoordinates.length;
    const totalSeconds = arrivalMinutes * 60;
    const timePerSegment = totalSeconds / (totalPoints - 1);
    let currentSegment = 0;
    
    // Timer de progression
    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => {
        const newSeconds = prev + 1;
        const remaining = Math.max(0, totalSeconds - newSeconds);
        setArrivalMinutes(Math.ceil(remaining / 60));
        
        // Mettre à jour l'animation de progression
        const progress = Math.min(1, newSeconds / totalSeconds);
        Animated.timing(progressAnim, {
          toValue: progress,
          duration: 1000,
          useNativeDriver: false,
        }).start();
        
        // Mettre à jour l'animation du timer
        Animated.timing(timerAnim, {
          toValue: progress,
          duration: 1000,
          useNativeDriver: true,
        }).start();
        
        return newSeconds;
      });
    }, 1000);
    
    // Animation du déplacement
    const moveWasher = () => {
      if (currentSegment < totalPoints - 1 && arrivalMinutes > 0) {
        const start = routeCoordinates[currentSegment];
        const end = routeCoordinates[currentSegment + 1];
        
        const steps = 50;
        let step = 0;
        
        const moveInterval = setInterval(() => {
          if (step <= steps && !isPaused) {
            const ratio = step / steps;
            const newLat = start.latitude + (end.latitude - start.latitude) * ratio;
            const newLng = start.longitude + (end.longitude - start.longitude) * ratio;
            
            setWasherLocation({
              latitude: newLat,
              longitude: newLng,
            });
            
            // Mettre à jour l'animation du laveur
            Animated.timing(washerAnim, {
              toValue: ratio,
              duration: 100,
              useNativeDriver: true,
            }).start();
            
            step++;
          } else if (step > steps) {
            clearInterval(moveInterval);
            currentSegment++;
            if (currentSegment < totalPoints - 1) {
              moveWasher();
            } else {
              // Arrivé à destination
              clearInterval(timerRef.current);
              setSimulationPhase('arrived');
            }
          }
        }, (timePerSegment * 1000) / steps);
      } else if (arrivalMinutes <= 0) {
        clearInterval(timerRef.current);
        setSimulationPhase('arrived');
      }
    };
    
    moveWasher();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleCallWasher = () => {
    Linking.openURL(`tel:${washer.phoneNumber}`);
  };

  const handleMessageWasher = () => {
    Alert.alert('Message', 'Fonctionnalité de messagerie bientôt disponible!');
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Annuler la commande',
      'Êtes-vous sûr de vouloir annuler cette commande ?',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui, annuler', 
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedDistance = () => {
    if (!washerLocation || !userLocation) return '0.0';
    
    // Calcul simplifié de distance (formule de Haversine simplifiée)
    const latDiff = washerLocation.latitude - userLocation.latitude;
    const lngDiff = washerLocation.longitude - userLocation.longitude;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
    return distance.toFixed(1);
  };

  const getAvatarSource = () => {
    return { uri: imageError ? FALLBACK_IMAGE : washer.avatar };
  };

  const renderWasherAvatar = () => (
    <Animated.View 
      style={[
        styles.avatarContainer,
        {
          transform: [
            { scale: pulseAnim },
            {
              translateY: washerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -5]
              })
            }
          ]
        }
      ]}
    >
      <Image 
        source={getAvatarSource()}
        style={styles.washerAvatar}
        onError={() => setImageError(true)}
      />
      <View style={styles.avatarBadge}>
        <Truck size={14} color="#FFFFFF" />
      </View>
      {simulationPhase === 'traveling' && (
        <View style={styles.movingIndicator}>
          <Navigation2 size={12} color="#4A6FFF" />
        </View>
      )}
    </Animated.View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <Animated.View 
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabel}>Départ</Text>
        <Text style={styles.progressLabel}>En route</Text>
        <Text style={styles.progressLabel}>Arrivée</Text>
      </View>
    </View>
  );

  const renderTimer = () => (
    <View style={styles.timerContainer}>
      <Animated.View 
        style={[
          styles.timerCircle,
          {
            transform: [
              {
                rotate: timerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }
            ]
          }
        ]}
      >
        <Clock size={24} color="#4A6FFF" />
      </Animated.View>
      <View style={styles.timerTextContainer}>
        <Text style={styles.timerTitle}>Temps restant</Text>
        <Text style={styles.timerValue}>
          {arrivalMinutes > 0 ? `${arrivalMinutes} min` : 'Presque arrivé!'}
        </Text>
        <Text style={styles.timerSubtitle}>
          {formatTime(elapsedSeconds)} écoulés
        </Text>
      </View>
    </View>
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: 5.3517,
          longitude: -4.0247,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* Marqueur utilisateur */}
        {userLocation && (
          <Marker coordinate={userLocation} title="Votre position">
            <View style={styles.userMarker}>
              <MapPin size={28} color="#4A6FFF" />
              <View style={styles.userMarkerRing} />
            </View>
          </Marker>
        )}
        
        {/* Marqueur du laveur */}
        {washerLocation && (
          <Marker coordinate={washerLocation} title={washer.name}>
            <Animated.View 
              style={[
                styles.washerMarker,
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <Image 
                source={getAvatarSource()}
                style={styles.markerImage}
              />
              <View style={[styles.markerBadge, { backgroundColor: washer.color }]}>
                <Truck size={12} color="#FFFFFF" />
              </View>
            </Animated.View>
          </Marker>
        )}
        
        {/* Trajet */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#4A6FFF"
            strokeWidth={4}
            lineDashPattern={[10, 10]}
          />
        )}
      </MapView>
      
      {/* Overlay info */}
      <View style={styles.mapOverlay}>
        <View style={styles.mapInfoCard}>
          <Text style={styles.mapInfoTitle}>Trajet en cours</Text>
          <View style={styles.mapInfoRow}>
            <View style={styles.mapInfoItem}>
              <Text style={styles.mapInfoLabel}>Distance</Text>
              <Text style={styles.mapInfoValue}>{getEstimatedDistance()} km</Text>
            </View>
            <View style={styles.mapInfoItem}>
              <Text style={styles.mapInfoLabel}>Vitesse moy.</Text>
              <Text style={styles.mapInfoValue}>25 km/h</Text>
            </View>
            <View style={styles.mapInfoItem}>
              <Text style={styles.mapInfoLabel}>ETA</Text>
              <Text style={styles.mapInfoValue}>{arrivalMinutes} min</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderWasherDetails = () => (
    <Animated.View 
      style={[
        styles.detailsContainer,
        {
          opacity: fadeInAnim,
          transform: [{
            translateY: slideUpAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.detailsHeader}
        onPress={() => setShowDetails(!showDetails)}
        activeOpacity={0.8}
      >
        <Text style={styles.detailsTitle}>Détails du laveur</Text>
        {showDetails ? <ChevronUp size={20} color="#8E8E93" /> : <ChevronDown size={20} color="#8E8E93" />}
      </TouchableOpacity>
      
      {showDetails && (
        <View style={styles.detailsContent}>
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            <View style={styles.detailRow}>
              <User size={16} color="#8E8E93" />
              <Text style={styles.detailLabel}>Nom complet:</Text>
              <Text style={styles.detailValue}>{washer.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Phone size={16} color="#8E8E93" />
              <Text style={styles.detailLabel}>Téléphone:</Text>
              <Text style={styles.detailValue}>{washer.phoneNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Star size={16} color="#8E8E93" />
              <Text style={styles.detailLabel}>Note:</Text>
              <Text style={styles.detailValue}>{washer.rating} ⭐ ({washer.reviews} avis)</Text>
            </View>
          </View>
          
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Véhicule et équipement</Text>
            <View style={styles.detailRow}>
              <CarIcon size={16} color="#8E8E93" />
              <Text style={styles.detailLabel}>Véhicule:</Text>
              <Text style={styles.detailValue}>{washer.vehicle?.model || 'Non spécifié'}</Text>
            </View>
            <View style={styles.equipmentList}>
              {washer.equipment?.map((item, index) => (
                <View key={index} style={styles.equipmentItem}>
                  <Sparkle size={12} color="#4A6FFF" />
                  <Text style={styles.equipmentText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{washer.experience}</Text>
                <Text style={styles.statLabel}>Expérience</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{washer.washCount}</Text>
                <Text style={styles.statLabel}>Lavages</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{washer.responseRate}%</Text>
                <Text style={styles.statLabel}>Réponse</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );

  const renderStatusCard = () => {
    const statusConfig = {
      preparing: {
        title: 'Préparation du laveur',
        subtitle: `${washer.firstName} prépare son équipement`,
        icon: <Package size={24} color="#FFB800" />,
        color: '#FFF8E6',
        borderColor: '#FFE7A6'
      },
      traveling: {
        title: 'En route vers vous',
        subtitle: `${washer.firstName} est en chemin`,
        icon: <Navigation2 size={24} color="#4A6FFF" />,
        color: '#F0F5FF',
        borderColor: '#D6E4FF'
      },
      arrived: {
        title: 'Laveur arrivé!',
        subtitle: `${washer.firstName} est arrivé à votre position`,
        icon: <CheckCircle size={24} color="#2ECC71" />,
        color: '#F0F9F2',
        borderColor: '#D4F1DC'
      }
    };
    
    const config = statusConfig[simulationPhase];
    
    return (
      <View style={[styles.statusCard, { backgroundColor: config.color, borderColor: config.borderColor }]}>
        <View style={styles.statusIcon}>
          {config.icon}
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>{config.title}</Text>
          <Text style={styles.statusSubtitle}>{config.subtitle}</Text>
        </View>
        <View style={styles.statusTime}>
          <Text style={styles.timeText}>{formatTime(elapsedSeconds)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="#1D1D1F" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Suivi de commande</Text>
          <Text style={styles.headerSubtitle}>Laveur #{washer.id}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.viewToggle}
          onPress={() => setIsMapView(!isMapView)}
        >
          {isMapView ? <List size={20} color="#4A6FFF" /> : <MapIcon size={20} color="#4A6FFF" />}
        </TouchableOpacity>
      </View>
      
      {/* Carte ou Vue principale */}
      {isMapView ? renderMapView() : (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar et infos du laveur */}
          <View style={styles.washerInfoContainer}>
            {renderWasherAvatar()}
            
            <View style={styles.washerInfo}>
              <Text style={styles.washerName}>{washer.name}</Text>
              <View style={styles.washerRating}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>{washer.rating}</Text>
                <Text style={styles.reviewsText}>({washer.reviews} avis)</Text>
              </View>
              <View style={styles.washerBadges}>
                {washer.badges?.map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          {/* Barre de progression */}
          {renderProgressBar()}
          
          {/* Carte de statut */}
          {renderStatusCard()}
          
          {/* Timer */}
          {renderTimer()}
          
          {/* Boutons de contrôle */}
          <View style={styles.controlButtons}>
            <TouchableOpacity 
              style={[styles.controlButton, styles.pauseButton]}
              onPress={togglePause}
            >
              {isPaused ? <Play size={20} color="#4A6FFF" /> : <Pause size={20} color="#4A6FFF" />}
              <Text style={styles.controlButtonText}>
                {isPaused ? 'Reprendre' : 'Pause'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, styles.contactButton]}
              onPress={() => setShowContactOptions(true)}
            >
              <Phone size={20} color="#FFFFFF" />
              <Text style={[styles.controlButtonText, styles.contactButtonText]}>
                Contacter
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Détails du laveur */}
          {renderWasherDetails()}
          
          {/* Résumé de la commande */}
          <View style={styles.orderSummary}>
            <Text style={styles.summaryTitle}>Résumé de la commande</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <MapPin size={16} color="#8E8E93" />
                <Text style={styles.summaryLabel}>Adresse</Text>
                <Text style={styles.summaryValue}>{bookingData.location}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Car size={16} color="#8E8E93" />
                <Text style={styles.summaryLabel}>Véhicule</Text>
                <Text style={styles.summaryValue}>{bookingData.vehicle}</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Droplets size={16} color="#8E8E93" />
                <Text style={styles.summaryLabel}>Type de lavage</Text>
                <Text style={styles.summaryValue}>{bookingData.washType}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Wallet size={16} color="#8E8E93" />
                <Text style={styles.summaryLabel}>Prix</Text>
                <Text style={styles.summaryPrice}>{bookingData.price.toLocaleString()} FCFA</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
      
      {/* Bouton d'annulation en bas */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancelOrder}
        >
          <RotateCcw size={18} color="#FF3B30" />
          <Text style={styles.cancelButtonText}>Annuler la commande</Text>
        </TouchableOpacity>
      </View>
      
      {/* Modal des options de contact */}
      <Modal
        visible={showContactOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowContactOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contacter {washer.firstName}</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                handleCallWasher();
                setShowContactOptions(false);
              }}
            >
              <Phone size={24} color="#4A6FFF" />
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Appeler</Text>
                <Text style={styles.modalOptionSubtitle}>{washer.phoneNumber}</Text>
              </View>
              <ChevronRight size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                handleMessageWasher();
                setShowContactOptions(false);
              }}
            >
              <MessageCircle size={24} color="#4A6FFF" />
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Envoyer un message</Text>
                <Text style={styles.modalOptionSubtitle}>Chat sécurisé</Text>
              </View>
              <ChevronRight size={20} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setShowContactOptions(false)}
            >
              <Text style={styles.closeModalText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles combinés pour les deux écrans
const styles = StyleSheet.create({
  // Styles existants (depuis votre code)
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F5FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#4A6FFF',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A6FFF',
  },
  summaryCard: {
    backgroundColor: '#F8F9FF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECFF',
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    fontSize: 15,
    color: '#1D1D1F',
    fontWeight: '500',
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4A6FFF',
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  rippleContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  ripple: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(74,111,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(74,111,255,0.2)',
  },
  searchIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A6FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  searchSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 40,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4A6FFF',
    borderRadius: 2,
  },
  washersContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  washersContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  washersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  washersTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  washersSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECFF',
  },
  washerCard: {
    marginBottom: 16,
  },
  cardContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContentSelected: {
    backgroundColor: '#F8F9FF',
    borderColor: '#4A6FFF',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#F2F2F7',
  },
  favoriteIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B8B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  premiumIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1D1D1F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  washerMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  washerName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8ECFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  rating: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFB800',
  },
  reviews: {
    fontSize: 14,
    color: '#8E8E93',
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  distanceTag: {
    backgroundColor: '#F2F5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECFF',
  },
  distance: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A6FFF',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8ECFF',
  },
  time: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: 'rgba(46,204,113,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2ECC71',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stat: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C7C7CC',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#F0F9F2',
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D4F1DC',
  },
  securityText: {
    fontSize: 13,
    color: '#2ECC71',
    fontWeight: '600',
  },
  confirmContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  confirmContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  confirmAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#F2F2F7',
  },
  confirmInfo: {
    flex: 1,
  },
  confirmName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  confirmTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A6FFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Styles pour la carte (Search Screen)
  mapContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  map: {
    flex: 1,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  closeMapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerContainerSelected: {
    borderWidth: 4,
    borderColor: '#4A6FFF',
    transform: [{ scale: 1.2 }],
  },
  markerImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  markerPremium: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1D1D1F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  userMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  centerMapButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 5,
  },
  mapBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  washersScroll: {
    paddingBottom: 10,
  },
  washerMapCard: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    minWidth: 80,
  },
  washerMapCardSelected: {
    backgroundColor: '#F8F9FF',
    borderColor: '#4A6FFF',
  },
  washerMapAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  washerMapName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  washerMapRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
  },
  washerMapRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFB800',
  },
  washerMapDistance: {
    fontSize: 11,
    color: '#4A6FFF',
    fontWeight: '600',
  },
  confirmMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6FFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    marginTop: 16,
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmMapButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  // Nouveaux styles pour l'écran de suivi
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  washerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  washerAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A6FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  movingIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A6FFF',
  },
  washerInfo: {
    flex: 1,
    marginLeft: 20,
  },
  washerName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  washerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFB800',
  },
  reviewsText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  washerBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A6FFF',
    borderRadius: 3,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 20,
  },
  statusIcon: {
    marginRight: 15,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusTime: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECFF',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A6FFF',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECFF',
    marginBottom: 20,
  },
  timerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#E8ECFF',
  },
  timerTextContainer: {
    flex: 1,
  },
  timerTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4A6FFF',
    marginBottom: 4,
  },
  timerSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  pauseButton: {
    backgroundColor: '#F2F5FF',
    borderWidth: 1,
    borderColor: '#E8ECFF',
  },
  contactButton: {
    backgroundColor: '#4A6FFF',
  },
  controlButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A6FFF',
  },
  contactButtonText: {
    color: '#FFFFFF',
  },
  detailsContainer: {
    backgroundColor: '#F8F9FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECFF',
    marginBottom: 20,
    overflow: 'hidden',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#1D1D1F',
    fontWeight: '500',
    flex: 1,
  },
  equipmentList: {
    gap: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  equipmentText: {
    fontSize: 13,
    color: '#1D1D1F',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    minWidth: 90,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4A6FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  orderSummary: {
    backgroundColor: '#F8F9FF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECFF',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4A6FFF',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFE5E5',
    backgroundColor: '#FFF5F5',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
  },
  // Styles pour la carte (Tracking Screen)
  mapOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  mapInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  mapInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  mapInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapInfoItem: {
    alignItems: 'center',
  },
  mapInfoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  mapInfoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A6FFF',
  },
  userMarkerRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'rgba(74,111,255,0.2)',
  },
  washerMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  markerBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  // Styles pour le modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    gap: 12,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  modalOptionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  closeModalButton: {
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  closeModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
});