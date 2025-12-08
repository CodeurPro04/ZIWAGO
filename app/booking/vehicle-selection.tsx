import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Animated, PanResponder, TextInput, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Wallet, ChevronRight, Navigation, Locate, Search, X } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Button } from '@/components/Button';
import { useUserStore } from '@/hooks/useUserData';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');
const BOTTOM_SHEET_MIN_HEIGHT = 450;
const BOTTOM_SHEET_MAX_HEIGHT = height - 120;
const MAPBOX_TOKEN = "pk.eyJ1IjoiY29kZXVycHJvMDQiLCJhIjoiY21jY2w4MW4zMDkxODJqcXNydWZkenBjYSJ9.d0SfKBeHypUYmQfJXjlR1Q";

interface LocationSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  context?: any[];
}

export default function VehicleSelectionScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { selectedLocation, selectedVehicle, walletBalance, updateUserData } = useUserStore();

  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [address, setAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([]);
  const [isSelectingOnMap, setIsSelectingOnMap] = useState(false);

  // Animation pour le bottom sheet
  const bottomSheetHeight = useRef(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)).current;
  const [sheetHeight, setSheetHeight] = useState(BOTTOM_SHEET_MIN_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);

  // PanResponder pour drag le bottom sheet
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
        if (newHeight >= BOTTOM_SHEET_MIN_HEIGHT && newHeight <= BOTTOM_SHEET_MAX_HEIGHT) {
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
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    })
  ).current;

  // Initialisation - Géolocalisation
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingLocation(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          
          setLocation(coords);

          // Reverse geocoding avec Mapbox
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json?access_token=${MAPBOX_TOKEN}`
            );
            const data = await response.json();
            const addressResult = data.features[0]?.place_name || 'Position actuelle';
            setAddress(addressResult);
            updateUserData('selectedLocation', addressResult);
          } catch (error) {
            console.log('Erreur géocodage:', error);
            setAddress('Position actuelle');
          }
        } else {
          // Position par défaut (Abidjan)
          const defaultPos = {
            latitude: 5.3364,
            longitude: -4.0267,
          };
          setLocation(defaultPos);
          setAddress('Abidjan, Côte d\'Ivoire');
        }
      } catch (error) {
        console.log('Erreur de localisation:', error);
        const defaultPos = {
          latitude: 5.3364,
          longitude: -4.0267,
        };
        setLocation(defaultPos);
        setAddress('Abidjan, Côte d\'Ivoire');
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  // Recherche avec Mapbox (debounced)
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
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_TOKEN}&country=CI&proximity=-4.0267,5.3364&limit=5&language=fr`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const vehicles = [
    { 
      type: 'Berline', 
      image: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f697.svg'
    },
    { 
      type: 'Compacte', 
      image: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f699.svg'
    },
    { 
      type: 'SUV', 
      image: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f69a.svg'
    },
  ];

  const handleContinue = () => {
    if (!selectedVehicle) {
      Alert.alert('Attention', 'Veuillez sélectionner un type de véhicule');
      return;
    }
    router.push('/booking/searching');
  };

  const centerMap = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        ...location,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Veuillez autoriser l\'accès à la localisation'
        );
        return;
      }

      setIsLoadingLocation(true);
      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      // Reverse geocoding Mapbox
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      const addressResult = data.features[0]?.place_name || 'Position actuelle';

      setLocation(coords);
      setAddress(addressResult);
      updateUserData('selectedLocation', addressResult);
      
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 800);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir votre position');
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

    // Reverse geocoding Mapbox
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinate.longitude},${coordinate.latitude}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      const addressResult = data.features[0]?.place_name || 'Position sélectionnée';
      
      setAddress(addressResult);
      updateUserData('selectedLocation', addressResult);
    } catch (error) {
      console.log('Erreur géocodage:', error);
      setAddress('Position sélectionnée');
      updateUserData('selectedLocation', `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`);
    }

    setIsSelectingOnMap(false);
  };

  const toggleMapSelection = () => {
    setIsSelectingOnMap(!isSelectingOnMap);
    if (!isSelectingOnMap) {
      setSearchQuery('');
      setSearchResults([]);
      Keyboard.dismiss();
    }
  };

  const selectSearchResult = (result: LocationSuggestion) => {
    const [longitude, latitude] = result.center;
    const coords = {
      latitude,
      longitude,
    };
    
    setLocation(coords);
    
    mapRef.current?.animateToRegion({
      ...coords,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 800);

    setAddress(result.place_name);
    updateUserData('selectedLocation', result.place_name);
    
    setSearchQuery('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

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
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsBuildings={true}
          showsTraffic={false}
          showsIndoors={true}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          onPress={handleMapPress}
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
                <View style={[
                  styles.markerInner,
                  isSelectingOnMap && styles.markerInnerActive
                ]}>
                  <Navigation size={16} color="white" />
                </View>
                <View style={styles.markerShadow} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Center Map Button */}
        <TouchableOpacity 
          style={styles.centerButton}
          onPress={centerMap}
          activeOpacity={0.8}
        >
          <Locate size={24} color={Colors.primary} />
        </TouchableOpacity>

        {/* My Location Button */}
        <TouchableOpacity 
          style={styles.myLocationButton}
          onPress={getCurrentLocation}
          activeOpacity={0.8}
        >
          <MapPin size={24} color={Colors.primary} />
        </TouchableOpacity>

        {/* Select on Map Button */}
        <TouchableOpacity 
          style={[
            styles.selectMapButton,
            isSelectingOnMap && styles.selectMapButtonActive
          ]}
          onPress={toggleMapSelection}
          activeOpacity={0.8}
        >
          <MapPin size={24} color={isSelectingOnMap ? '#FFFFFF' : Colors.primary} />
        </TouchableOpacity>

        {/* Instruction Banner */}
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
          onPress={() => router.back()}
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
              placeholder="Rechercher une adresse à Abidjan..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (isSelectingOnMap) {
                  setIsSelectingOnMap(false);
                }
              }}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setSearchQuery('');
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
          }
        ]}
      >
        {/* Handle - Draggable */}
        <View 
          style={styles.handleContainer}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          scrollEnabled={sheetHeight > BOTTOM_SHEET_MIN_HEIGHT && !isDragging}
          style={styles.scrollContent}
        >
          {/* Location Info */}
          <View style={styles.locationInfo}>
            <MapPin size={24} color={Colors.primary} />
            <Text style={styles.locationTitle} numberOfLines={2}>
              {address || 'Sélectionnez votre position'}
            </Text>
          </View>

          {/* Section Title */}
          <Text style={styles.sectionTitle}>Choisissez le type de véhicule</Text>

          {/* Vehicle Selection */}
          <View style={styles.vehicleContainer}>
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.type}
                style={[
                  styles.vehicleCard,
                  selectedVehicle === vehicle.type && styles.vehicleCardActive,
                ]}
                onPress={() => updateUserData('selectedVehicle', vehicle.type)}
                activeOpacity={0.7}
              >
                <View style={styles.vehicleImageContainer}>
                  <Image
                    source={{ uri: vehicle.image }}
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

          {/* Wallet Info */}
          <TouchableOpacity style={styles.walletInfo} activeOpacity={0.7}>
            <View style={styles.walletIconContainer}>
              <Wallet size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.walletText}>
              Solde du portefeuille : {walletBalance.toLocaleString()} F CFA
            </Text>
            <ChevronRight size={24} color="#666666" />
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity 
            style={[
              styles.continueButton,
              !selectedVehicle && styles.continueButtonDisabled
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E8EAF6',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
  },
  searchContainer: {
    position: 'absolute',
    top: 60,
    left: 70,
    right: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    padding: 0,
  },
  searchResults: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    borderRadius: 12,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  searchResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultText: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerInnerActive: {
    backgroundColor: '#FF6B35',
    transform: [{ scale: 1.2 }],
  },
  markerShadow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: 4,
  },
  centerButton: {
    position: 'absolute',
    bottom: 30,
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
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 90,
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
  },
  selectMapButton: {
    position: 'absolute',
    bottom: 150,
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
  },
  selectMapButtonActive: {
    backgroundColor: Colors.primary,
  },
  instructionBanner: {
    position: 'absolute',
    bottom: 210,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  vehicleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  vehicleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  vehicleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F7FF',
  },
  vehicleImageContainer: {
    width: 80,
    height: 60,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  vehicleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  walletIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});