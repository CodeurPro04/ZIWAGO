import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  PanResponder,
  TextInput,
  Keyboard,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  MapPin,
  Wallet,
  ChevronRight,
  Navigation,
  Locate,
  Search,
  X,
  Car,
  CheckCircle,
  ChevronLeft,
  Target,
  Star,
  Clock,
  ShieldCheck,
} from "lucide-react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");
const BOTTOM_SHEET_MIN_HEIGHT = 420;
const BOTTOM_SHEET_MAX_HEIGHT = height - 80;
const MAPBOX_TOKEN = "pk.eyJ1IjoiY29kZXVycHJvMDQiLCJhIjoiY21jY2w4MW4zMDkxODJqcXNydWZkenBjYSJ9.d0SfKBeHypUYmQfJXjlR1Q";

// Types
interface LocationSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  text?: string;
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

interface SavedLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isCurrent?: boolean;
  timestamp: number;
}

// Design System
const COLORS = {
  primary: "#4A6FFF",
  primaryLight: "#F2F5FF",
  primaryLighter: "#F8F9FF",
  white: "#FFFFFF",
  black: "#1D1D1F",
  gray1: "#8E8E93",
  gray2: "#C7C7CC",
  gray3: "#F2F2F7",
  success: "#2ECC71",
  successLight: "#F0F9F2",
  warning: "#FFB800",
  error: "#FF3B30",
  background: "#FFFFFF",
  card: "#FFFFFF",
  overlay: "rgba(0,0,0,0.4)",
};

const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: "800", lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: "700", lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: "600", lineHeight: 24 },
  body: { fontSize: 16, fontWeight: "500", lineHeight: 22 },
  caption: { fontSize: 14, fontWeight: "500", lineHeight: 18 },
  small: { fontSize: 12, fontWeight: "500", lineHeight: 16 },
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export default function BookingWizardScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const searchInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // États principaux
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedWashType, setSelectedWashType] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([]);
  const [isSelectingOnMap, setIsSelectingOnMap] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [showSavedLocations, setShowSavedLocations] = useState(false);

  // Animation
  const bottomSheetHeight = useRef(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)).current;
  const [sheetHeight, setSheetHeight] = useState(BOTTOM_SHEET_MIN_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const stepAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  // Données
  const vehicles = [
    { type: "Berline", image: require("@/assets/images/berline1.png") },
    { type: "Compacte", image: require("@/assets/images/compacte.png") },
    { type: "SUV", image: require("@/assets/images/suv.png") },
  ];

  const washTypes = [
    {
      type: "Extérieur uniquement",
      title: "Extérieur uniquement",
      price: 2000,
      description: "Carrosserie, vitres et pneus",
      icon: require("@/assets/images/exterieur.jpg"),
      duration: "20 min",
    },
    {
      type: "Intérieur uniquement",
      title: "Intérieur uniquement",
      price: 2500,
      description: "Sièges, tapis et tableau de bord",
      icon: require("@/assets/images/interieur.jpg"),
      duration: "30 min",
    },
    {
      type: "Lavage complet",
      title: "Lavage complet",
      price: 4000,
      description: "Extérieur et intérieur complets",
      icon: require("@/assets/images/complet.jpg"),
      duration: "45 min",
    },
  ];

  // PanResponder pour le bottom sheet
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderGrant: () => {
        setIsDragging(true);
        Keyboard.dismiss();
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = sheetHeight - gestureState.dy;
        if (newHeight >= BOTTOM_SHEET_MIN_HEIGHT && newHeight <= BOTTOM_SHEET_MAX_HEIGHT) {
          bottomSheetHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        const newHeight = sheetHeight - gestureState.dy;
        let targetHeight = BOTTOM_SHEET_MIN_HEIGHT;

        if (gestureState.dy < -50) {
          targetHeight = BOTTOM_SHEET_MAX_HEIGHT;
        } else if (gestureState.dy > 50) {
          targetHeight = BOTTOM_SHEET_MIN_HEIGHT;
        } else {
          targetHeight = newHeight < (BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_MAX_HEIGHT) / 2 
            ? BOTTOM_SHEET_MIN_HEIGHT 
            : BOTTOM_SHEET_MAX_HEIGHT;
        }

        setSheetHeight(targetHeight);
        Animated.spring(bottomSheetHeight, {
          toValue: targetHeight,
          useNativeDriver: false,
          tension: 65,
          friction: 10,
        }).start();
      },
    })
  ).current;

  // Initialisation
  useEffect(() => {
    initLocation();
    loadSavedLocations();
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchLocation(searchQuery);
      } else {
        setSearchResults([]);
        Animated.spring(searchAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }).start();
      }
    }, 400);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const initLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        setLocation(coords);
        await reverseGeocode(coords, "current");

        // Enregistrer la position actuelle
        saveLocation("Position actuelle", coords, true);
      } else {
        setDefaultLocation();
      }
    } catch (error) {
      console.error("Erreur d'initialisation:", error);
      setDefaultLocation();
    } finally {
      setIsLoadingLocation(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const setDefaultLocation = () => {
    const defaultPos = { latitude: 5.3364, longitude: -4.0267 };
    setLocation(defaultPos);
    setAddress("Abidjan, Plateau");
  };

  // Géocodage inversé amélioré pour obtenir le nom de rue
  const reverseGeocode = async (coords: { latitude: number; longitude: number }, type: "current" | "selected" = "current") => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json?` +
        `access_token=${MAPBOX_TOKEN}` +
        `&types=address,street,poi,neighborhood` +
        `&language=fr` +
        `&limit=3`
      );

      const data = await response.json();
      
      if (data.features?.length > 0) {
        // Priorité: rue > adresse > quartier > lieu
        const streetFeature = data.features.find((f: any) => 
          f.place_type?.includes("street") || 
          f.place_type?.includes("address")
        );
        
        const feature = streetFeature || data.features[0];
        let addressText = feature.text || "Localisation inconnue";
        
        // Ajouter le contexte (quartier, ville) si disponible
        const context = feature.context?.filter((ctx: any) => 
          ctx.id.includes("place") || 
          ctx.id.includes("region") ||
          ctx.id.includes("locality")
        ).map((ctx: any) => ctx.text);
        
        if (context && context.length > 0) {
          addressText += `, ${context[0]}`;
        }
        
        setAddress(addressText);
        return addressText;
      }
    } catch (error) {
      console.error("Erreur de géocodage:", error);
      setAddress(type === "current" ? "Position actuelle" : "Emplacement sélectionné");
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}` +
        `&country=CI` +
        `&proximity=-4.0267,5.3364` +
        `&limit=7` +
        `&language=fr` +
        `&types=address,poi,neighborhood`
      );
      
      const data = await response.json();
      setSearchResults(data.features || []);
      
      if (data.features?.length > 0) {
        Animated.spring(searchAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }).start();
      }
    } catch (error) {
      console.error("Erreur de recherche:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = async (result: LocationSuggestion) => {
    const [longitude, latitude] = result.center;
    const coords = { latitude, longitude };
    
    setLocation(coords);
    setAddress(result.place_name);
    setSearchQuery("");
    setSearchResults([]);
    
    // Sauvegarder cette location
    saveLocation("Adresse recherchée", coords);
    
    // Animer la carte
    mapRef.current?.animateToRegion({
      ...coords,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 800);
    
    Keyboard.dismiss();
  };

  const saveLocation = (name: string, coords: { latitude: number; longitude: number }, isCurrent = false) => {
    const newLocation: SavedLocation = {
      id: Date.now().toString(),
      name,
      address: address || name,
      latitude: coords.latitude,
      longitude: coords.longitude,
      isCurrent,
      timestamp: Date.now(),
    };
    
    setSavedLocations(prev => {
      const filtered = prev.filter(loc => !loc.isCurrent);
      const updated = [newLocation, ...filtered].slice(0, 5); // Garder les 5 dernières
      // Ici vous pourriez sauvegarder dans AsyncStorage
      return updated;
    });
  };

  const loadSavedLocations = () => {
    // Charger depuis AsyncStorage
    const mockSaved = [
      {
        id: "1",
        name: "Domicile",
        address: "Rue des Jardins, Cocody",
        latitude: 5.3364,
        longitude: -4.0267,
        timestamp: Date.now(),
      },
      {
        id: "2",
        name: "Bureau",
        address: "Avenue Marchand, Plateau",
        latitude: 5.3200,
        longitude: -4.0200,
        timestamp: Date.now() - 86400000,
      },
    ];
    setSavedLocations(mockSaved);
  };

  const selectSavedLocation = (saved: SavedLocation) => {
    const coords = { latitude: saved.latitude, longitude: saved.longitude };
    setLocation(coords);
    setAddress(saved.address);
    setShowSavedLocations(false);
    
    mapRef.current?.animateToRegion({
      ...coords,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 800);
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission requise", "Veuillez autoriser l'accès à la localisation dans les paramètres");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setLocation(coords);
      await reverseGeocode(coords, "current");
      
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 800);

      saveLocation("Position actuelle", coords, true);
    } catch (error) {
      console.error("Erreur de localisation:", error);
      Alert.alert("Erreur", "Impossible d'obtenir votre position actuelle");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapPress = async (event: any) => {
    if (!isSelectingOnMap) return;

    const coordinate = event.nativeEvent.coordinate;
    const coords = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    };

    setLocation(coords);
    const newAddress = await reverseGeocode(coords, "selected");
    
    // Demander un nom pour cette location
    Alert.prompt(
      "Enregistrer cet emplacement",
      "Donnez un nom à cet emplacement (ex: Domicile, Bureau)",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Enregistrer", 
          onPress: (name) => saveLocation(name || "Emplacement sauvegardé", coords)
        }
      ],
      "plain-text",
      "",
      "default"
    );

    setIsSelectingOnMap(false);
  };

  const handleContinue = () => {
    if (!selectedVehicle) {
      Alert.alert("Sélection requise", "Veuillez choisir un type de véhicule");
      return;
    }

    Animated.spring(stepAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();

    setCurrentStep(2);
    setSheetHeight(BOTTOM_SHEET_MAX_HEIGHT);
    Animated.spring(bottomSheetHeight, {
      toValue: BOTTOM_SHEET_MAX_HEIGHT,
      useNativeDriver: false,
      tension: 65,
      friction: 10,
    }).start();
  };

  const handleRequest = () => {
    if (!selectedWashType) {
      Alert.alert("Sélection requise", "Veuillez choisir un type de lavage");
      return;
    }

    const selectedWash = washTypes.find(wash => wash.type === selectedWashType);
    
    router.push({
      pathname: "/booking/searching",
      params: {
        address: encodeURIComponent(address),
        latitude: location?.latitude.toString(),
        longitude: location?.longitude.toString(),
        vehicle: encodeURIComponent(selectedVehicle),
        washType: encodeURIComponent(selectedWashType),
        price: selectedWash?.price.toString() || "2000",
        duration: selectedWash?.duration || "20 min",
      },
    });
  };

  const goBackToVehicle = () => {
    Animated.spring(stepAnimation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
    setCurrentStep(1);
  };

  // Animation interpolation pour les transitions d'étape
  const step1TranslateX = stepAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });

  const step2TranslateX = stepAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  // Render functions
  const renderMap = () => {
    if (isLoadingLocation || !location) {
      return (
        <Animated.View style={[styles.mapPlaceholder, { opacity: fadeAnim }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.placeholderText}>Localisation en cours...</Text>
        </Animated.View>
      );
    }

    return (
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            ...location,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          showsBuildings={true}
          onPress={handleMapPress}
          maxZoomLevel={19}
          minZoomLevel={15}
        >
          {location && (
            <Marker
              coordinate={location}
              title="Votre position"
              description={address}
              draggable={isSelectingOnMap}
              onDragEnd={handleMapPress}
            >
              <View style={styles.customMarker}>
                <View style={[styles.markerInner, isSelectingOnMap && styles.markerInnerActive]}>
                  <Navigation size={16} color="white" />
                </View>
                {isSelectingOnMap && (
                  <View style={styles.markerPulse} />
                )}
              </View>
            </Marker>
          )}
        </MapView>

        <TouchableOpacity
          style={[styles.mapButton, styles.centerButton]}
          onPress={() => {
            if (mapRef.current && location) {
              mapRef.current.animateToRegion({
                ...location,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }, 500);
            }
          }}
        >
          <Locate size={22} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mapButton, styles.myLocationButton]}
          onPress={getCurrentLocation}
        >
          <Target size={22} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mapButton, styles.selectLocationButton]}
          onPress={() => setIsSelectingOnMap(!isSelectingOnMap)}
        >
          <MapPin size={22} color={isSelectingOnMap ? COLORS.white : COLORS.primary} />
        </TouchableOpacity>

        {isSelectingOnMap && (
          <View style={styles.instructionBanner}>
            <Text style={styles.instructionText}>
              📍 Touchez la carte pour sélectionner un emplacement
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => currentStep === 1 ? router.back() : goBackToVehicle()}
        >
          <ChevronLeft size={24} color={COLORS.black} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {currentStep === 1 ? "Véhicule" : "Type de lavage"}
          </Text>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]} />
          </View>
        </View>

        <View style={styles.placeholder} />
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        {renderMap()}

        {/* Search Bar avec position fixe */}
        <KeyboardAvoidingView 
          style={styles.searchWrapper}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 80}
        >
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={COLORS.gray1} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Rechercher une adresse..."
                placeholderTextColor={COLORS.gray1}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
                onFocus={() => {
                  if (searchResults.length > 0) {
                    Animated.spring(searchAnim, {
                      toValue: 1,
                      useNativeDriver: true,
                      tension: 60,
                      friction: 8,
                    }).start();
                  }
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    Animated.spring(searchAnim, {
                      toValue: 0,
                      useNativeDriver: true,
                      tension: 60,
                      friction: 8,
                    }).start();
                  }}
                >
                  <X size={20} color={COLORS.gray1} />
                </TouchableOpacity>
              )}
              {savedLocations.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowSavedLocations(!showSavedLocations)}
                  style={styles.savedLocationsButton}
                >
                  <Star size={18} color={COLORS.primary} fill={showSavedLocations ? COLORS.primary : "none"} />
                </TouchableOpacity>
              )}
            </View>

            {/* Suggestions de recherche */}
            <Animated.View 
              style={[
                styles.searchResults,
                {
                  opacity: searchAnim,
                  transform: [{
                    translateY: searchAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })
                  }]
                }
              ]}
              pointerEvents={searchResults.length > 0 ? "auto" : "none"}
            >
              {searchResults.length > 0 && (
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  style={styles.searchResultsScroll}
                >
                  {searchResults.map((result) => (
                    <TouchableOpacity
                      key={result.id}
                      style={styles.searchResultItem}
                      onPress={() => selectSearchResult(result)}
                    >
                      <View style={styles.searchResultIcon}>
                        <MapPin size={18} color={COLORS.primary} />
                      </View>
                      <View style={styles.searchResultText}>
                        <Text style={styles.searchResultTitle} numberOfLines={1}>
                          {result.text || result.place_name.split(',')[0]}
                        </Text>
                        <Text style={styles.searchResultSubtitle} numberOfLines={1}>
                          {result.place_name.split(',').slice(1).join(',').trim()}
                        </Text>
                      </View>
                      <ChevronRight size={18} color={COLORS.gray2} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </Animated.View>

            {/* Locations sauvegardées */}
            {showSavedLocations && (
              <View style={styles.savedLocationsContainer}>
                <View style={styles.savedLocationsHeader}>
                  <Text style={styles.savedLocationsTitle}>Adresses fréquentes</Text>
                  <TouchableOpacity onPress={() => setShowSavedLocations(false)}>
                    <X size={20} color={COLORS.gray1} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.savedLocationsList}>
                  {savedLocations.map((saved) => (
                    <TouchableOpacity
                      key={saved.id}
                      style={styles.savedLocationItem}
                      onPress={() => selectSavedLocation(saved)}
                    >
                      <View style={styles.savedLocationIcon}>
                        {saved.isCurrent ? (
                          <Locate size={18} color={COLORS.primary} />
                        ) : (
                          <Star size={18} color={COLORS.primary} />
                        )}
                      </View>
                      <View style={styles.savedLocationText}>
                        <Text style={styles.savedLocationName}>{saved.name}</Text>
                        <Text style={styles.savedLocationAddress} numberOfLines={1}>
                          {saved.address}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[styles.bottomSheet, { height: bottomSheetHeight }]}
        pointerEvents={isDragging ? "none" : "auto"}
      >
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        <View style={styles.stepsContainer}>
          {/* Étape 1 : Véhicule */}
          <Animated.View
            style={[
              styles.step,
              {
                transform: [{ translateX: step1TranslateX }],
                opacity: stepAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0.5, 0],
                }),
              },
            ]}
          >
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              scrollEnabled={sheetHeight > BOTTOM_SHEET_MIN_HEIGHT && !isDragging}
              style={styles.scrollContent}
            >
              {/* Adresse actuelle */}
              <View style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <MapPin size={20} color={COLORS.primary} />
                  <Text style={styles.locationTitle}>Adresse de lavage</Text>
                </View>
                <Text style={styles.locationAddress} numberOfLines={2}>
                  {address || "Sélectionnez une adresse"}
                </Text>
                <TouchableOpacity
                  style={styles.changeLocationButton}
                  onPress={() => {
                    searchInputRef.current?.focus();
                    setSheetHeight(BOTTOM_SHEET_MIN_HEIGHT);
                    Animated.spring(bottomSheetHeight, {
                      toValue: BOTTOM_SHEET_MIN_HEIGHT,
                      useNativeDriver: false,
                      tension: 65,
                      friction: 10,
                    }).start();
                  }}
                >
                  <Text style={styles.changeLocationText}>Changer d'adresse</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Type de véhicule</Text>

              <View style={styles.vehicleGrid}>
                {vehicles.map((vehicle) => {
                  const isSelected = selectedVehicle === vehicle.type;
                  return (
                    <TouchableOpacity
                      key={vehicle.type}
                      style={[
                        styles.vehicleCard,
                        isSelected && styles.vehicleCardActive,
                      ]}
                      onPress={() => setSelectedVehicle(vehicle.type)}
                    >
                      <View style={styles.vehicleImageContainer}>
                        <Image
                          source={vehicle.image}
                          style={styles.vehicleImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.vehicleText}>{vehicle.type}</Text>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <CheckCircle size={20} color={COLORS.primary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !selectedVehicle && styles.primaryButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={!selectedVehicle}
              >
                <Text style={styles.primaryButtonText}>Continuer</Text>
                <ChevronRight size={20} color={COLORS.white} />
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>

          {/* Étape 2 : Lavage */}
          <Animated.View
            style={[
              styles.step,
              {
                transform: [{ translateX: step2TranslateX }],
                opacity: stepAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.5, 1],
                }),
              },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              scrollEnabled={sheetHeight > BOTTOM_SHEET_MIN_HEIGHT && !isDragging}
              style={styles.scrollContent}
            >
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Type de lavage</Text>
                <TouchableOpacity onPress={goBackToVehicle} style={styles.editButton}>
                  <Text style={styles.editButtonText}>Modifier</Text>
                </TouchableOpacity>
              </View>

              {/* Résumé */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <MapPin size={16} color={COLORS.gray1} />
                  <Text style={styles.summaryText} numberOfLines={1}>{address}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Car size={16} color={COLORS.gray1} />
                  <Text style={styles.summaryText}>{selectedVehicle}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Choisissez un lavage</Text>

              {washTypes.map((wash) => {
                const isSelected = selectedWashType === wash.type;
                return (
                  <TouchableOpacity
                    key={wash.type}
                    style={[
                      styles.washCard,
                      isSelected && styles.washCardActive,
                    ]}
                    onPress={() => setSelectedWashType(wash.type)}
                  >
                    <Image source={wash.icon} style={styles.washImage} />
                    <View style={styles.washContent}>
                      <View>
                        <Text style={styles.washTitle}>{wash.title}</Text>
                        <Text style={styles.washDescription}>{wash.description}</Text>
                      </View>
                      <View style={styles.washMeta}>
                        <View style={styles.washDuration}>
                          <Clock size={14} color={COLORS.gray1} />
                          <Text style={styles.washDurationText}>{wash.duration}</Text>
                        </View>
                        <Text style={styles.washPrice}>{wash.price.toLocaleString()} F CFA</Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View style={styles.washCheckmark}>
                        <CheckCircle size={20} color={COLORS.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              <View style={styles.securityBadge}>
                <ShieldCheck size={18} color={COLORS.success} />
                <Text style={styles.securityText}>Paiement sécurisé • Satisfaction garantie</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.requestButton,
                  !selectedWashType && styles.primaryButtonDisabled,
                ]}
                onPress={handleRequest}
                disabled={!selectedWashType}
              >
                <Text style={styles.primaryButtonText}>Rechercher un laveur</Text>
                <ChevronRight size={20} color={COLORS.white} />
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === "ios" ? SPACING.sm : (StatusBar.currentHeight || 0) + SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
    zIndex: 100,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray3,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  stepIndicator: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray3,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.gray3,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray1,
    marginTop: SPACING.md,
  },
  searchWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.black,
    padding: 0,
    marginHorizontal: SPACING.sm,
  },
  savedLocationsButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
  searchResults: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    maxHeight: 280,
  },
  searchResultsScroll: {
    maxHeight: 280,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  searchResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.black,
    fontWeight: "600",
    marginBottom: 2,
  },
  searchResultSubtitle: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray1,
  },
  savedLocationsContainer: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    overflow: "hidden",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    maxHeight: 300,
  },
  savedLocationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  savedLocationsTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.black,
    fontWeight: "600",
  },
  savedLocationsList: {
    maxHeight: 250,
  },
  savedLocationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  savedLocationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  savedLocationText: {
    flex: 1,
  },
  savedLocationName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.black,
    fontWeight: "600",
    marginBottom: 2,
  },
  savedLocationAddress: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray1,
  },
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  markerInnerActive: {
    backgroundColor: "#FF6B35",
  },
  markerPulse: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary,
    animationKeyframes: {
      '0%': { transform: [{ scale: 1 }], opacity: 1 },
      '100%': { transform: [{ scale: 2 }], opacity: 0 },
    },
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
  mapButton: {
    position: "absolute",
    right: SPACING.md,
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.gray3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 5,
  },
  centerButton: {
    bottom: 160,
  },
  myLocationButton: {
    bottom: 100,
  },
  selectLocationButton: {
    bottom: 40,
    backgroundColor: COLORS.primary,
  },
  instructionBanner: {
    position: "absolute",
    top: SPACING.xxl,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.overlay,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  instructionText: {
    color: COLORS.white,
    ...TYPOGRAPHY.caption,
    fontWeight: "600",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  handleContainer: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray2,
    borderRadius: 2,
  },
  stepsContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  step: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  locationCard: {
    backgroundColor: COLORS.primaryLighter,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  locationTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: SPACING.sm,
  },
  locationAddress: {
    ...TYPOGRAPHY.body,
    color: COLORS.black,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  changeLocationButton: {
    alignSelf: "flex-start",
  },
  changeLocationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "600",
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.black,
    marginBottom: SPACING.lg,
  },
  vehicleGrid: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  vehicleCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.gray3,
  },
  vehicleCardActive: {
    backgroundColor: COLORS.primaryLighter,
    borderColor: COLORS.primary,
  },
  vehicleImageContainer: {
    width: 80,
    height: 60,
    marginBottom: SPACING.sm,
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
  },
  vehicleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.black,
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.gray2,
    opacity: 0.6,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    fontWeight: "600",
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  stepTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.black,
  },
  editButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  editButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: COLORS.gray3,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  summaryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.black,
    flex: 1,
  },
  washCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.gray3,
    overflow: "hidden",
  },
  washCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLighter,
  },
  washImage: {
    width: 100,
    height: 100,
  },
  washContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: "space-between",
  },
  washTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.black,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  washDescription: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray1,
  },
  washMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  washDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  washDurationText: {
    ...TYPOGRAPHY.small,
    color: COLORS.gray1,
  },
  washPrice: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: "700",
  },
  washCheckmark: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.successLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  securityText: {
    ...TYPOGRAPHY.small,
    color: COLORS.success,
    fontWeight: "600",
  },
  requestButton: {
    marginBottom: SPACING.xxl,
  },
});