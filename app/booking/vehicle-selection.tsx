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
  Sparkles,
  Brush,
} from "lucide-react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";

const { width, height } = Dimensions.get("window");
const BOTTOM_SHEET_MIN_HEIGHT = 450;
const BOTTOM_SHEET_MAX_HEIGHT = height - 120;
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiY29kZXVycHJvMDQiLCJhIjoiY21jY2w4MW4zMDkxODJqcXNydWZkenBjYSJ9.d0SfKBeHypUYmQfJXjlR1Q";

interface LocationSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

export default function BookingWizardScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  // État de l'écran (1 = véhicule, 2 = type de lavage)
  const [currentStep, setCurrentStep] = useState(1);

  // Données utilisateur
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedWashType, setSelectedWashType] = useState("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([]);
  const [isSelectingOnMap, setIsSelectingOnMap] = useState(false);

  // Animation
  const bottomSheetHeight = useRef(
    new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)
  ).current;
  const [sheetHeight, setSheetHeight] = useState(BOTTOM_SHEET_MIN_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const stepAnimation = useRef(new Animated.Value(0)).current;

  // PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = sheetHeight - gestureState.dy;
        if (
          newHeight >= BOTTOM_SHEET_MIN_HEIGHT &&
          newHeight <= BOTTOM_SHEET_MAX_HEIGHT
        ) {
          bottomSheetHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        const newHeight = sheetHeight - gestureState.dy;
        let targetHeight = BOTTOM_SHEET_MIN_HEIGHT;

        if (gestureState.dy < -100) {
          targetHeight = BOTTOM_SHEET_MAX_HEIGHT;
        } else if (gestureState.dy > 100) {
          targetHeight = BOTTOM_SHEET_MIN_HEIGHT;
        } else {
          targetHeight =
            newHeight < (BOTTOM_SHEET_MIN_HEIGHT + BOTTOM_SHEET_MAX_HEIGHT) / 2
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
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    })
  ).current;

  // Initialisation
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingLocation(true);
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
          });

          const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };

          setLocation(coords);

          // Reverse geocoding précis
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json?access_token=${MAPBOX_TOKEN}&types=address`
            );
            const data = await response.json();
            const addressResult =
              data.features[0]?.place_name || "Position actuelle";
            setAddress(addressResult);
          } catch (error) {
            console.log("Erreur géocodage:", error);
            setAddress("Position actuelle");
          }
        } else {
          // Position par défaut
          const defaultPos = {
            latitude: 5.3364,
            longitude: -4.0267,
          };
          setLocation(defaultPos);
          setAddress("Abidjan, Côte d'Ivoire");
        }
      } catch (error) {
        console.log("Erreur de localisation:", error);
        const defaultPos = {
          latitude: 5.3364,
          longitude: -4.0267,
        };
        setLocation(defaultPos);
        setAddress("Abidjan, Côte d'Ivoire");
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  // Recherche
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchLocation(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const searchLocation = async (query: string) => {
    if (!query || query.trim().length < 2) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_TOKEN}&country=CI&proximity=-4.0267,5.3364&limit=5&language=fr&types=address,poi`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error("Erreur de recherche:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const vehicles = [
    {
      type: "Berline",
      image: require("@/assets/images/berline1.png"),
    },
    {
      type: "Compacte",
      image: require("@/assets/images/compacte.png"),
    },
    {
      type: "SUV",
      image: require("@/assets/images/suv.png"),
    },
  ];

  const washTypes = [
    {
      type: "exterior",
      title: "Extérieur uniquement",
      price: 2000,
      description: "Carrosserie, vitres et pneus",
      image: require("@/assets/images/exterieur.jpg"), // Image locale
    },
    {
      type: "interior",
      title: "Intérieur uniquement",
      price: 2500,
      description: "Sièges, tapis et tableau de bord",
      image: require("@/assets/images/interieur.jpg"),
    },
    {
      type: "complete",
      title: "Lavage complet",
      price: 4000,
      description: "Extérieur et intérieur complets",
      image: require("@/assets/images/complet.jpg"),
    },
  ];

  const handleContinue = () => {
    if (!selectedVehicle) {
      Alert.alert("Attention", "Veuillez sélectionner un type de véhicule");
      return;
    }

    // Animation de transition vers l'étape 2
    Animated.spring(stepAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();

    setCurrentStep(2);
    // Agrandir le bottom sheet pour afficher plus de contenu
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
      Alert.alert("Attention", "Veuillez sélectionner un type de lavage");
      return;
    }
    router.push("/booking/searching");
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

  const centerMap = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion(
        {
          ...location,
          latitudeDelta: 0.005, // Plus précis
          longitudeDelta: 0.005,
        },
        500
      );
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Veuillez autoriser l'accès à la localisation"
        );
        return;
      }

      setIsLoadingLocation(true);
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json?access_token=${MAPBOX_TOKEN}&types=address`
      );
      const data = await response.json();
      const addressResult = data.features[0]?.place_name || "Position actuelle";

      setLocation(coords);
      setAddress(addressResult);

      mapRef.current?.animateToRegion(
        {
          ...coords,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        800
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'obtenir votre position");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapPress = async (event: any) => {
    if (!isSelectingOnMap) return;

    const coordinate = event.nativeEvent.coordinate;

    setLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinate.longitude},${coordinate.latitude}.json?access_token=${MAPBOX_TOKEN}&types=address`
      );
      const data = await response.json();
      const addressResult =
        data.features[0]?.place_name || "Position sélectionnée";
      setAddress(addressResult);
    } catch (error) {
      console.log("Erreur géocodage:", error);
      setAddress("Position sélectionnée");
    }

    setIsSelectingOnMap(false);
  };

  const selectSearchResult = (result: LocationSuggestion) => {
    const [longitude, latitude] = result.center;
    const coords = {
      latitude,
      longitude,
    };

    setLocation(coords);

    mapRef.current?.animateToRegion(
      {
        ...coords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      800
    );

    setAddress(result.place_name);
    setSearchQuery("");
    setSearchResults([]);
    Keyboard.dismiss();
  };

  // Animation interpolation
  const step1TranslateX = stepAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });

  const step2TranslateX = stepAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  const renderMap = () => {
    if (isLoadingLocation || !location) {
      return (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.placeholderText}>Chargement de la carte...</Text>
        </View>
      );
    }

    return (
      <>
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
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
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
                <View
                  style={[
                    styles.markerInner,
                    isSelectingOnMap && styles.markerInnerActive,
                  ]}
                >
                  <Navigation size={16} color="white" />
                </View>
                <View style={styles.markerShadow} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Boutons de contrôle */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={centerMap}
          activeOpacity={0.8}
        >
          <Locate size={24} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={getCurrentLocation}
          activeOpacity={0.8}
        >
          <MapPin size={24} color={Colors.primary} />
        </TouchableOpacity>

        {isSelectingOnMap && (
          <View style={styles.instructionBanner}>
            <Text style={styles.instructionText}>
              📍 Cliquez sur la carte ou déplacez le marqueur
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        {renderMap()}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            currentStep === 1 ? router.back() : goBackToVehicle()
          }
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#666666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une adresse précise..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#666666" />
              </TouchableOpacity>
            )}
            {isSearching && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {searchResults.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    style={styles.searchResultItem}
                    onPress={() => selectSearchResult(result)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.searchResultIcon}>
                      <MapPin size={18} color={Colors.primary} />
                    </View>
                    <View style={styles.searchResultText}>
                      <Text style={styles.searchResultTitle} numberOfLines={2}>
                        {result.place_name}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#CCCCCC" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: bottomSheetHeight,
            zIndex: isDragging ? 1000 : 1,
          },
        ]}
      >
        {/* Handle - Draggable */}
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        <View style={styles.stepsContainer}>
          {/* Étape 1 : Sélection du véhicule */}
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
              showsVerticalScrollIndicator={false}
              scrollEnabled={
                sheetHeight > BOTTOM_SHEET_MIN_HEIGHT && !isDragging
              }
              style={styles.scrollContent}
            >
              {/* Location Info */}
              <View style={styles.locationInfo}>
                <MapPin size={24} color={Colors.primary} />
                <Text style={styles.locationTitle} numberOfLines={2}>
                  {address || "Sélectionnez votre position"}
                </Text>
              </View>

              {/* Section Title */}
              <Text style={styles.sectionTitle}>
                Choisissez le type de véhicule
              </Text>

              {/* Vehicle Selection */}
              <View style={styles.vehicleContainer}>
                {vehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.type}
                    style={[
                      styles.vehicleCard,
                      selectedVehicle === vehicle.type &&
                        styles.vehicleCardActive,
                    ]}
                    onPress={() => setSelectedVehicle(vehicle.type)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.vehicleImageContainer}>
                      <Image
                        source={vehicle.image}
                        style={styles.vehicleImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.vehicleText}>{vehicle.type}</Text>
                    {selectedVehicle === vehicle.type && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !selectedVehicle && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={!selectedVehicle}
              >
                <Text style={styles.continueButtonText}>Continuer</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>

          {/* Étape 2 : Type de lavage */}
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
              scrollEnabled={
                sheetHeight > BOTTOM_SHEET_MIN_HEIGHT && !isDragging
              }
              style={styles.scrollContent}
            >
              {/* Header */}
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Type de lavage</Text>
                <View style={styles.stepIndicator}>
                  <View style={styles.stepDotActive} />
                  <View style={styles.stepDotActive} />
                  <View style={styles.stepDotInactive} />
                </View>
              </View>

              {/* Location and Vehicle Info */}
              <View style={styles.infoCard}>
                <MapPin size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{address}</Text>
              </View>

              <View style={styles.infoCard}>
                <Car size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{selectedVehicle}</Text>
              </View>

              {/* Wash Types */}
              <Text style={styles.sectionTitle}>
                Choisissez le type de lavage
              </Text>

              {washTypes.map((wash) => (
                <TouchableOpacity
                  key={wash.type}
                  style={[
                    styles.washCard,
                    selectedWashType === wash.type && styles.washCardActive,
                  ]}
                  onPress={() => setSelectedWashType(wash.type)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={wash.image} 
                    style={styles.washImage}
                    resizeMode="contain"
                  />
                  <View style={styles.washDetails}>
                    <Text style={styles.washTitle}>{wash.title}</Text>
                    <Text style={styles.washPrice}>
                      {wash.price.toLocaleString()} F CFA
                    </Text>
                    <Text style={styles.washDescription}>
                      {wash.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Wallet Info */}
              <TouchableOpacity style={styles.walletInfo} activeOpacity={0.7}>
                <Wallet size={24} color={Colors.primary} />
                <Text style={styles.walletText}>
                  Solde du portefeuille : 100.000 F CFA
                </Text>
                <ChevronRight size={24} color={Colors.textSecondary} />
              </TouchableOpacity>

              {/* Request Button */}
              <TouchableOpacity
                style={[
                  styles.requestButton,
                  !selectedWashType && styles.requestButtonDisabled,
                ]}
                onPress={handleRequest}
                activeOpacity={0.8}
                disabled={!selectedWashType}
              >
                <Text style={styles.requestButtonText}>Demander un laveur</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 12,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: "#000000",
  },
  searchContainer: {
    position: "absolute",
    top: 60,
    left: 70,
    right: 16,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000000",
    padding: 0,
  },
  searchResults: {
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    borderRadius: 12,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  searchResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  searchResultText: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerInnerActive: {
    backgroundColor: "#FF6B35",
    transform: [{ scale: 1.2 }],
  },
  markerShadow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0,0.2)",
    marginTop: 4,
  },
  centerButton: {
    position: "absolute",
    bottom: 30,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 5,
  },
  myLocationButton: {
    position: "absolute",
    bottom: 90,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 5,
  },
  instructionBanner: {
    position: "absolute",
    bottom: 150,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    zIndex: 5,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
  stepsContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  step: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },
  vehicleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  vehicleCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    position: "relative",
  },
  vehicleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: "#F0F7FF",
  },
  vehicleImageContainer: {
    width: 80,
    height: 60,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
  },
  vehicleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  continueButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Step 2 Styles
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  stepIndicator: {
    flexDirection: "row",
    gap: 6,
  },
  stepDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  stepDotInactive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    flex: 1,
  },
  washCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  washCardActive: {
    borderColor: Colors.primary,
    backgroundColor: "#F0F7FF",
  },
  washIcon: {
    fontSize: 50,
  },
  washDetails: {
    flex: 1,
  },
  washTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  washPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  washDescription: {
    fontSize: 12,
    color: "#666666",
  },
  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  walletText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  requestButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  requestButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  washImage: {
    width: 90,
    height: 100,
    marginRight: 5,
    // Effet de scale doux
    transform: [{ scale: 0.85 }],
  },
});
