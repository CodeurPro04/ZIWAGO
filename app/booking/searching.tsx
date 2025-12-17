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
  PanResponder,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
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
  Navigation,
  User,
  Award,
  Phone,
  MessageCircle,
  Bell,
  Settings,
  Heart,
  AlertCircle,
  Zap,
  Target,
  Shield as ShieldIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const SEARCH_DURATION = 25;
const MAX_WASHERS = 5;

// Images locales - Vous devrez créer ces images dans votre dossier assets
// OU utiliser des URLs d'images de profil
const MOCK_WASHERS = [
  {
    id: 1,
    name: 'Jean K.',
    firstName: 'Jean',
    rating: 4.9,
    reviews: 247,
    distance: 0.8,
    time: 8,
    // Utilisation d'URL d'images de profil (exemples)
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    // OU pour des images locales :
    // avatar: require('../../assets/washers/jean.jpg'),
    color: '#4A6FFF',
    backgroundColor: '#4A6FFF20',
    latitude: 5.3482,
    longitude: -4.0212,
    badges: ['TOP', 'PRO'],
    experience: '3 ans',
    washCount: 512,
    responseRate: 98,
    vehicle: 'Berline grise',
    plate: 'CI-123-AB',
    status: 'available',
    description: 'Spécialiste intérieur',
    languages: ['Français', 'Dioula'],
    isFavorite: true,
    isPremium: true
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
    backgroundColor: '#FF6B8B20',
    latitude: 5.3463,
    longitude: -4.0228,
    badges: ['RAPIDE'],
    experience: '2 ans',
    washCount: 347,
    responseRate: 95,
    vehicle: 'SUV noir',
    plate: 'CI-456-CD',
    status: 'available',
    description: 'Expert carrosserie',
    languages: ['Français', 'Baoulé'],
    isFavorite: false,
    isPremium: true
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
    backgroundColor: '#2ECC7120',
    latitude: 5.3475,
    longitude: -4.0205,
    badges: ['ECO'],
    experience: '1 an',
    washCount: 198,
    responseRate: 92,
    vehicle: 'Compacte blanche',
    plate: 'CI-789-EF',
    status: 'available',
    description: 'Détail complet',
    languages: ['Français'],
    isFavorite: true,
    isPremium: false
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
    backgroundColor: '#9B59B620',
    latitude: 5.3458,
    longitude: -4.0235,
    badges: ['NEW'],
    experience: '6 mois',
    washCount: 87,
    responseRate: 88,
    vehicle: 'Berline rouge',
    plate: 'CI-012-GH',
    status: 'busy',
    description: 'Nettoyage écologique',
    languages: ['Français', 'Malinké'],
    isFavorite: false,
    isPremium: false
  },
  {
    id: 5,
    name: 'Mohamed C.',
    firstName: 'Mohamed',
    rating: 4.5,
    reviews: 76,
    distance: 2.0,
    time: 18,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    color: '#E67E22',
    backgroundColor: '#E67E2220',
    latitude: 5.3445,
    longitude: -4.0242,
    badges: [],
    experience: '8 mois',
    washCount: 65,
    responseRate: 85,
    vehicle: 'SUV argent',
    plate: 'CI-345-IJ',
    status: 'available',
    description: 'Service rapide',
    languages: ['Français', 'Sénoufo'],
    isFavorite: false,
    isPremium: false
  },
];

const WASH_TYPES = {
  exterior: { title: 'Extérieur', price: 2000, icon: '🚗' },
  interior: { title: 'Intérieur', price: 2500, icon: '🧹' },
  complete: { title: 'Complet', price: 4000, icon: '✨' }
};

// Image de fallback pour quand l'image ne charge pas
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop';

export default function SearchingScreen() {
  const router = useRouter();
  const [timer, setTimer] = useState(0);
  const [searchPhase, setSearchPhase] = useState('initializing');
  const [washers, setWashers] = useState([]);
  const [selectedWasher, setSelectedWasher] = useState(null);
  const [showWasherDetails, setShowWasherDetails] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('3-5 min');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: 5.3475,
    longitude: -4.0215,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });
  const [imageErrors, setImageErrors] = useState({});

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const washerCardsAnim = useRef(new Animated.Value(0)).current;
  const searchIconAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const panelHeightAnim = useRef(new Animated.Value(height * 0.7)).current;

  // Références
  const mapRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {},
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50) {
          togglePanel();
        } else if (gestureState.dy < -50) {
          togglePanel();
        }
      },
    })
  ).current;

  // Données de la réservation
  const bookingData = {
    location: 'Riviera 2, Carrefour Duncan',
    address: 'Rue D43, près de la pharmacie',
    vehicle: 'Berline',
    washType: 'exterior',
    price: 2000,
    coordinates: { latitude: 5.3475, longitude: -4.0215 }
  };

  // Initialisation
  useEffect(() => {
    startSearchAnimation();
    simulateSearchProcess();
    
    return () => {
      clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const startSearchAnimation = () => {
    // Animation de pulsation pour le marqueur
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Animation de recherche
    Animated.loop(
      Animated.sequence([
        Animated.timing(searchIconAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(searchIconAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Ripple effect
    Animated.loop(
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const togglePanel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPanelExpanded(!isPanelExpanded);
    
    Animated.spring(panelHeightAnim, {
      toValue: isPanelExpanded ? height * 0.3 : height * 0.7,
      useNativeDriver: false,
      tension: 50,
      friction: 12,
    }).start();
    
    if (!isPanelExpanded) {
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: 5.3475,
          longitude: -4.0215,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        }, 500);
      }
    }
  };

  const simulateSearchProcess = () => {
    const phases = [
      { phase: 'initializing', duration: 2000, message: 'Initialisation...' },
      { phase: 'searching', duration: 5000, message: 'Recherche de laveurs...' },
      { phase: 'analyzing', duration: 4000, message: 'Analyse des profils...' },
      { phase: 'connecting', duration: 3000, message: 'Connexion en cours...' },
      { phase: 'found', duration: 2000, message: 'Laveurs disponibles !' }
    ];

    let elapsedTime = 0;

    phases.forEach((phase, index) => {
      setTimeout(() => {
        setSearchPhase(phase.phase);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const progress = ((index + 1) / phases.length) * 100;
        setSearchProgress(progress);

        Animated.timing(progressAnim, {
          toValue: progress / 100,
          duration: phase.duration,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }).start();

        if (phase.phase === 'searching' || phase.phase === 'analyzing') {
          const newWashers = MOCK_WASHERS.slice(0, index + 1);
          setWashers(newWashers);
        }

        if (phase.phase === 'found') {
          setWashers(MOCK_WASHERS);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          Animated.timing(washerCardsAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }).start();
        }
      }, elapsedTime);

      elapsedTime += phase.duration;
    });

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimer(elapsed);
      
      if (elapsed >= SEARCH_DURATION) {
        clearInterval(timerInterval);
      }
    }, 1000);
  };

  const handleSelectWasher = (washer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedWasher(washer);
    setShowWasherDetails(true);
    
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: washer.latitude,
        longitude: washer.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
    }
  };

  const handleConfirmWasher = () => {
    if (selectedWasher) {
      router.push({
        pathname: '/booking/confirmation',
        params: { 
          washerId: selectedWasher.id,
          washerName: selectedWasher.name,
          price: bookingData.price,
          estimatedTime: selectedWasher.time
        }
      });
    }
  };

  const handleCancelSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Annuler la recherche ?',
      'Êtes-vous sûr de vouloir annuler la recherche d\'un laveur ?',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui, annuler', 
          style: 'destructive',
          onPress: () => router.back()
        },
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return '#2ECC71';
      case 'busy': return '#E74C3C';
      case 'offline': return '#95A5A6';
      default: return '#4A6FFF';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'available': return 'Disponible';
      case 'busy': return 'Occupé';
      case 'offline': return 'Hors ligne';
      default: return 'Inconnu';
    }
  };

  const handleImageError = (washerId) => {
    setImageErrors(prev => ({ ...prev, [washerId]: true }));
  };

  const getAvatarSource = (washer) => {
    if (typeof washer.avatar === 'string' && washer.avatar.startsWith('http')) {
      return { uri: imageErrors[washer.id] ? FALLBACK_IMAGE : washer.avatar };
    }
    return washer.avatar;
  };

  const renderSearchHeader = () => (
    <BlurView intensity={80} tint="dark" style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleCancelSearch}
        >
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Recherche en cours</Text>
          <Text style={styles.headerSubtitle}>
            {searchPhase === 'initializing' && 'Initialisation...'}
            {searchPhase === 'searching' && 'Recherche de laveurs à proximité'}
            {searchPhase === 'analyzing' && 'Analyse des meilleurs profils'}
            {searchPhase === 'connecting' && 'Connexion aux laveurs...'}
            {searchPhase === 'found' && `${washers.length} laveurs disponibles`}
          </Text>
        </View>
        
        <View style={styles.timerContainer}>
          <Clock size={16} color="#FFFFFF" />
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
      </View>
    </BlurView>
  );

  const renderSearchIndicator = () => (
    <View style={styles.searchIndicator}>
      <Animated.View 
        style={[
          styles.rippleCircle,
          {
            transform: [{
              scale: rippleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2.5]
              })
            }],
            opacity: rippleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0]
            })
          }
        ]}
      />
      <Animated.View 
        style={[
          styles.searchCenter,
          {
            transform: [{
              scale: pulseAnim
            }]
          }
        ]}
      >
        <Animated.View 
          style={{
            opacity: searchIconAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1]
            })
          }}
        >
          <Sparkles size={28} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
      <Text style={styles.searchIndicatorText}>
        Recherche dans un rayon de 2km
      </Text>
    </View>
  );

  const renderWasherMarker = (washer) => (
    <Marker
      key={washer.id}
      coordinate={{ latitude: washer.latitude, longitude: washer.longitude }}
      onPress={() => handleSelectWasher(washer)}
    >
      <Animated.View 
        style={[
          styles.washerMarker,
          {
            borderColor: selectedWasher?.id === washer.id ? '#FFFFFF' : washer.color,
            transform: [{
              scale: selectedWasher?.id === washer.id ? 
                Animated.add(1.1, Animated.multiply(pulseAnim, 0.1)) : 1
            }]
          }
        ]}
      >
        <Image 
          source={getAvatarSource(washer)}
          style={styles.washerMarkerImage}
          onError={() => handleImageError(washer.id)}
        />
        {washer.isPremium && (
          <View style={styles.premiumBadge}>
            <Star size={8} color="#FFD700" fill="#FFD700" />
          </View>
        )}
      </Animated.View>
    </Marker>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabel}>Départ</Text>
        <Text style={styles.progressLabel}>Recherche</Text>
        <Text style={styles.progressLabel}>Analyse</Text>
        <Text style={styles.progressLabel}>Connexion</Text>
        <Text style={styles.progressLabel}>Terminé</Text>
      </View>
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
        <View style={styles.progressDots}>
          {[0, 0.25, 0.5, 0.75, 1].map((position, index) => (
            <Animated.View 
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: progressAnim.interpolate({
                    inputRange: [position - 0.01, position],
                    outputRange: ['#4A6FFF', '#FFFFFF']
                  }),
                  borderColor: progressAnim.interpolate({
                    inputRange: [position - 0.01, position],
                    outputRange: ['#4A6FFF', '#4A6FFF']
                  })
                }
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const renderCompactPanel = () => (
    <View style={styles.compactPanel}>
      <View style={styles.compactHeader}>
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle}>{washers.filter(w => w.status === 'available').length} laveurs disponibles</Text>
          <Text style={styles.compactSubtitle}>{formatTime(timer)} • Proche de vous</Text>
        </View>
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={togglePanel}
        >
          <ChevronUp size={20} color="#4A6FFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.compactWashersScroll}
      >
        {washers.filter(w => w.status === 'available').map((washer) => (
          <TouchableOpacity
            key={washer.id}
            style={[
              styles.compactWasherCard,
              selectedWasher?.id === washer.id && styles.compactWasherCardSelected
            ]}
            onPress={() => handleSelectWasher(washer)}
          >
            <Image 
              source={getAvatarSource(washer)}
              style={styles.compactWasherAvatar}
              onError={() => handleImageError(washer.id)}
            />
            <Text style={styles.compactWasherName}>{washer.firstName}</Text>
            <View style={styles.compactWasherRating}>
              <Star size={10} color="#FFD700" fill="#FFD700" />
              <Text style={styles.compactWasherRatingText}>{washer.rating}</Text>
            </View>
            <Text style={styles.compactWasherTime}>{washer.time} min</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderWasherCard = (washer, index) => {
    const isSelected = selectedWasher?.id === washer.id;
    const isAvailable = washer.status === 'available';
    const arrivalTime = `${washer.time} min`;

    return (
      <TouchableOpacity
        key={washer.id}
        style={[
          styles.washerCard,
          isSelected && styles.washerCardSelected,
          !isAvailable && styles.washerCardBusy
        ]}
        onPress={() => isAvailable && handleSelectWasher(washer)}
        activeOpacity={isAvailable ? 0.7 : 1}
        disabled={!isAvailable}
      >
        <View style={styles.washerCardHeader}>
          <View style={styles.washerAvatarContainer}>
            <Image 
              source={getAvatarSource(washer)}
              style={styles.washerAvatar}
              onError={() => handleImageError(washer.id)}
            />
            {washer.isFavorite && (
              <View style={styles.favoriteBadge}>
                <Heart size={10} color="#FFFFFF" fill="#E74C3C" />
              </View>
            )}
          </View>
          
          <View style={styles.washerInfo}>
            <View style={styles.washerNameRow}>
              <Text style={styles.washerName}>{washer.name}</Text>
              {washer.isPremium && (
                <View style={styles.premiumTag}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.premiumText}>PRO</Text>
                </View>
              )}
            </View>
            
            <View style={styles.washerStats}>
              <View style={styles.ratingContainer}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>{washer.rating}</Text>
                <Text style={styles.reviewsText}>({washer.reviews})</Text>
              </View>
              
              <View style={styles.statusBadge}>
                <View 
                  style={[
                    styles.statusDot, 
                    { backgroundColor: getStatusColor(washer.status) }
                  ]} 
                />
                <Text style={styles.statusText}>
                  {getStatusText(washer.status)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.washerDescription}>{washer.description}</Text>
          </View>
          
          <View style={styles.washerDistance}>
            <Text style={styles.distanceText}>{washer.distance} km</Text>
            <Text style={styles.timeText}>{arrivalTime}</Text>
          </View>
        </View>
        
        <View style={styles.washerBadges}>
          {washer.badges.map((badge, idx) => (
            <View key={idx} style={styles.badge}>
              <Award size={10} color="#4A6FFF" />
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
          <Text style={styles.experienceText}>{washer.experience} • {washer.washCount}+ lavages</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.selectButton,
            isSelected && styles.selectButtonSelected,
            !isAvailable && styles.selectButtonDisabled
          ]}
          onPress={() => isAvailable && handleSelectWasher(washer)}
          disabled={!isAvailable}
        >
          {isSelected ? (
            <>
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.selectButtonText}>Sélectionné</Text>
            </>
          ) : !isAvailable ? (
            <Text style={styles.selectButtonText}>Indisponible</Text>
          ) : (
            <>
              <Text style={styles.selectButtonText}>Choisir</Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderFullPanel = () => (
    <Animated.View 
      style={[
        styles.bottomPanel,
        {
          height: panelHeightAnim,
        }
      ]}
    >
      <View {...panResponder.panHandlers}>
        <View style={styles.panelHandle}>
          <View style={styles.handleBar}>
            <TouchableOpacity onPress={togglePanel} style={styles.toggleButton}>
              {isPanelExpanded ? <ChevronDown size={20} color="#8E8E93" /> : <ChevronUp size={20} color="#8E8E93" />}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {searchPhase !== 'found' && renderProgressBar()}
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Votre demande</Text>
          <View style={styles.summaryDetails}>
            <View style={styles.summaryRow}>
              <MapPin size={16} color="#4A6FFF" />
              <Text style={styles.summaryText}>{bookingData.location}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Car size={16} color="#4A6FFF" />
              <Text style={styles.summaryText}>{bookingData.vehicle} • {WASH_TYPES[bookingData.washType].title}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Wallet size={16} color="#4A6FFF" />
              <Text style={styles.summaryPrice}>{bookingData.price.toLocaleString()} FCFA</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.washersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchPhase === 'found' ? 'Laveurs disponibles' : 'Recherche en cours...'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {searchPhase === 'found' 
                ? `${washers.filter(w => w.status === 'available').length} disponibles maintenant`
                : 'Nous trouvons les meilleurs laveurs pour vous'}
            </Text>
          </View>
          
          {searchPhase === 'found' ? (
            <Animated.View 
              style={{
                opacity: washerCardsAnim
              }}
            >
              {washers.map(renderWasherCard)}
            </Animated.View>
          ) : (
            <View style={styles.searchingPlaceholder}>
              <Animated.View 
                style={{
                  transform: [{
                    rotate: searchIconAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }]
                }}
              >
                <Sparkles size={40} color="#4A6FFF" />
              </Animated.View>
              <Text style={styles.searchingText}>
                Recherche de laveurs à proximité...
              </Text>
              <Text style={styles.searchingSubtext}>
                {washers.length} trouvés sur {MAX_WASHERS}
              </Text>
            </View>
          )}
        </View>
        {/* Carte de sécurité et d'assurance 
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <ShieldIcon size={20} color="#2ECC71" />
            <Text style={styles.securityTitle}>Assurance Ziwago</Text>
          </View>
          <View style={styles.securityFeatures}>
            <View style={styles.securityFeature}>
              <CheckCircle size={14} color="#2ECC71" />
              <Text style={styles.securityText}>Laveurs vérifiés et formés</Text>
            </View>
            <View style={styles.securityFeature}>
              <CheckCircle size={14} color="#2ECC71" />
              <Text style={styles.securityText}>Paiement 100% sécurisé</Text>
            </View>
            <View style={styles.securityFeature}>
              <CheckCircle size={14} color="#2ECC71" />
              <Text style={styles.securityText}>Assurance qualité incluse</Text>
            </View>
          </View>
        </View> */}
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancelSearch}
        >
          <Text style={styles.cancelButtonText}>Annuler la recherche</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {renderSearchHeader()}
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          region={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
        >
          <Circle
            center={bookingData.coordinates}
            radius={2000}
            strokeWidth={1}
            strokeColor="rgba(74, 111, 255, 0.3)"
            fillColor="rgba(74, 111, 255, 0.1)"
          />
          
          <Marker coordinate={bookingData.coordinates}>
            <Animated.View style={[styles.userMarker, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.userMarkerInner}>
                <MapPin size={20} color="#FFFFFF" />
              </View>
            </Animated.View>
          </Marker>
          
          {washers.map(renderWasherMarker)}
        </MapView>
        
        {renderSearchIndicator()}
        
        <TouchableOpacity 
          style={styles.mapControlButton}
          onPress={() => {
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: 5.3475,
                longitude: -4.0215,
                latitudeDelta: 0.025,
                longitudeDelta: 0.025,
              }, 500);
            }
          }}
        >
          <Navigation size={20} color="#4A6FFF" />
        </TouchableOpacity>
      </View>
      
      {isPanelExpanded ? renderFullPanel() : renderCompactPanel()}
      
      {selectedWasher && selectedWasher.status === 'available' && (
        <Animated.View 
          style={[
            styles.confirmationButtonContainer,
            {
              transform: [{
                translateY: showWasherDetails ? 0 : 100
              }],
              opacity: showWasherDetails ? 1 : 0
            }
          ]}
        >
          <BlurView intensity={80} tint="dark" style={styles.confirmationButtonBlur}>
            <View style={styles.confirmationButtonContent}>
              <View style={styles.confirmationInfo}>
                <Image 
                  source={getAvatarSource(selectedWasher)}
                  style={styles.confirmationAvatar}
                  onError={() => handleImageError(selectedWasher.id)}
                />
                <View style={styles.confirmationDetails}>
                  <Text style={styles.confirmationName}>{selectedWasher.name}</Text>
                  <Text style={styles.confirmationTime}>Arrivée estimée : {selectedWasher.time} min</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.confirmationButton}
                onPress={handleConfirmWasher}
              >
                <Text style={styles.confirmationButtonText}>Confirmer</Text>
                <ChevronRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchIndicator: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -60 }],
    alignItems: 'center',
  },
  rippleCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(74, 111, 255, 0.2)',
  },
  searchCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A6FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  searchIndicatorText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  userMarker: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A6FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  washerMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4A6FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    backgroundColor: '#FFFFFF',
  },
  washerMarkerImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  premiumBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  compactPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.25,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  compactSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  expandButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactWashersScroll: {
    flexGrow: 0,
  },
  compactWasherCard: {
    alignItems: 'center',
    marginRight: 15,
    padding: 12,
    backgroundColor: '#F8F9FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  compactWasherCardSelected: {
    backgroundColor: '#4A6FFF',
    borderColor: '#4A6FFF',
  },
  compactWasherAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  compactWasherName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  compactWasherRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactWasherRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 2,
  },
  compactWasherTime: {
    fontSize: 12,
    color: '#4A6FFF',
    fontWeight: '700',
  },
  panelHandle: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  handleBar: {
    width: 100,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButton: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A6FFF',
    borderRadius: 2,
  },
  progressDots: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 2,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    marginTop: -2,
  },
  summaryCard: {
    backgroundColor: '#F8F9FF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  summaryDetails: {
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
  washersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
  searchingPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#F8F9FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8F0FF',
    borderStyle: 'dashed',
  },
  searchingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6FFF',
    marginTop: 16,
    marginBottom: 4,
  },
  searchingSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  washerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  washerCardSelected: {
    borderColor: '#4A6FFF',
    backgroundColor: '#F8FAFF',
    shadowColor: '#4A6FFF',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  washerCardBusy: {
    opacity: 0.7,
  },
  washerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  washerAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  washerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  favoriteBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  washerInfo: {
    flex: 1,
  },
  washerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  washerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1D1D1F',
    marginRight: 8,
  },
  premiumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
  },
  washerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9500',
    marginLeft: 4,
    marginRight: 2,
  },
  reviewsText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
  },
  washerDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },
  washerDistance: {
    alignItems: 'flex-end',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A6FFF',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  washerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A6FFF',
  },
  experienceText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6FFF',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  selectButtonSelected: {
    backgroundColor: '#2ECC71',
  },
  selectButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  selectButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  securityCard: {
    backgroundColor: '#F0F9F0',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4EDDA',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2ECC71',
  },
  securityFeatures: {
    gap: 10,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#666666',
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE8E8',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E74C3C',
  },
  mapControlButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmationButtonContainer: {
    position: 'absolute',
    bottom: height * 0.25,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  confirmationButtonBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  confirmationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  confirmationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  confirmationAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  confirmationDetails: {
    flex: 1,
  },
  confirmationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  confirmationTime: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  confirmationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A6FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  confirmationButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});