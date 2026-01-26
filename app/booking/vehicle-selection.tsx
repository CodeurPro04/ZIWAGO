import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Keyboard,
  ActivityIndicator,
  StatusBar,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import {
  ChevronLeft,
  Locate,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react-native";
import { useUserStore } from "@/hooks/useUserData";
import BerlineSvg from "@/assets/svg/berline.svg";
import CompacteSvg from "@/assets/svg/compacte.svg";
import SuvSvg from "@/assets/svg/suv.svg";
import GroupSvg from "@/assets/svg/Group.svg";
import Group5Svg from "@/assets/svg/Group5.svg";
import Group7Svg from "@/assets/svg/Group7.svg";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiY29kZXVycHJvMDQiLCJhIjoiY21jY2w4MW4zMDkxODJqcXNydWZkenBjYSJ9.d0SfKBeHypUYmQfJXjlR1Q";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const MAP_STYLE = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f4f6fb" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#5f6b7a" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#e7ebf4" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7b8794" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#b9d7ff" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#e5eaf2" }],
  },
];

const SHEET_EXPANDED_HEIGHT = Math.min(560, SCREEN_HEIGHT * 0.65);

const VEHICLES = [
  {
    key: "Berline",
    label: "Berline",
    icon: BerlineSvg,
  },
  {
    key: "Compacte",
    label: "Compacte",
    icon: CompacteSvg,
  },
  {
    key: "SUV",
    label: "SUV",
    icon: SuvSvg,
  },
];

const WASH_TYPES = [
  {
    key: "exterior",
    title: "Extérieur uniquement",
    description: "Carrosserie, vitres et pneus",
    duration: "20 min",
    price: 2000,
    icon: GroupSvg,
  },
  {
    key: "interior",
    title: "Intérieur uniquement",
    description: "Sièges, tapis et tableau de bord",
    duration: "30 min",
    price: 2500,
    icon: Group5Svg,
  },
  {
    key: "complete",
    title: "Lavage complet",
    description: "Extérieur + intérieur complets",
    duration: "45 min",
    price: 4000,
    icon: Group7Svg,
  },
];

type LocationSuggestion = {
  id: string;
  place_name: string;
  center: [number, number];
};

export default function BookingNowScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const {
    selectedLocation,
    selectedLocationCoords,
    selectedVehicle,
    selectedWashType,
    walletBalance,
    updateUserData,
  } = useUserStore();

  const [coords, setCoords] = useState(
    selectedLocationCoords || { latitude: 5.3364, longitude: -4.0267 }
  );
  const [address, setAddress] = useState(selectedLocation);
  const [isLoadingLocation, setIsLoadingLocation] = useState(!selectedLocationCoords);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isSearchingWasher, setIsSearchingWasher] = useState(false);
  const [isWasherFound, setIsWasherFound] = useState(false);
  const [searchElapsed, setSearchElapsed] = useState(0);
  const [foundWasher, setFoundWasher] = useState<{ name: string; eta: number } | null>(null);
  const foundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const selectedWash = useMemo(
    () => WASH_TYPES.find((wash) => wash.key === selectedWashType) || WASH_TYPES[0],
    [selectedWashType]
  );

  useEffect(() => {
    if (selectedLocationCoords) {
      setCoords(selectedLocationCoords);
      setAddress(selectedLocation);
      return;
    }

    const init = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setIsLoadingLocation(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const nextCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(nextCoords);
        await reverseGeocode(nextCoords);
      } catch (error) {
        setIsLoadingLocation(false);
      }
    };

    init();
  }, [selectedLocationCoords, selectedLocation]);

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
    if (!isSearchingWasher) {
      setSearchElapsed(0);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 1000);
      setSearchElapsed(diff);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSearchingWasher]);

  useEffect(() => {
    return () => {
      if (foundTimerRef.current) {
        clearTimeout(foundTimerRef.current);
        foundTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const handle = setTimeout(() => {
      searchLocation(searchQuery);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const reverseGeocode = async (locationCoords: { latitude: number; longitude: number }) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${locationCoords.latitude}&lon=${locationCoords.longitude}&zoom=18&addressdetails=1`,
        {
          headers: { "User-Agent": "ZIWAGO/1.0" },
        }
      );
      const data = await response.json();
      const nextAddress = data.display_name || "Position actuelle";
      setAddress(nextAddress);
      updateUserData("selectedLocation", nextAddress);
      updateUserData("selectedLocationCoords", locationCoords);
    } catch (error) {
      setAddress("Position actuelle");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const searchLocation = async (query: string) => {
    try {
      setIsSearching(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ci&addressdetails=1&limit=6`,
        {
          headers: { "User-Agent": "ZIWAGO/1.0" },
        }
      );
      const data = await response.json();
      const mappedResults = (data || []).map((item: any) => ({
        id: item.place_id?.toString() || item.osm_id?.toString(),
        place_name: item.display_name,
        center: [parseFloat(item.lon), parseFloat(item.lat)],
      }));
      setSearchResults(mappedResults);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearch = async (item: LocationSuggestion) => {
    const [longitude, latitude] = item.center;
    const nextCoords = { latitude, longitude };
    setSearchQuery("");
    setSearchResults([]);
    Keyboard.dismiss();
    setCoords(nextCoords);
    setAddress(item.place_name);
    updateUserData("selectedLocation", item.place_name);
    updateUserData("selectedLocationCoords", nextCoords);
    mapRef.current?.animateToRegion(
      {
        ...nextCoords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      500
    );
  };

  const handleMapPress = async (event: any) => {
    const nextCoords = event.nativeEvent.coordinate;
    setCoords(nextCoords);
    await reverseGeocode(nextCoords);
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setIsLoadingLocation(false);
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoords(nextCoords);
      await reverseGeocode(nextCoords);
      mapRef.current?.animateToRegion(
        {
          ...nextCoords,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500
      );
    } catch (error) {
      setIsLoadingLocation(false);
    }
  };

  const handleRequest = () => {
    if (!selectedVehicle) {
      return;
    }

    if (foundTimerRef.current) {
      clearTimeout(foundTimerRef.current);
      foundTimerRef.current = null;
    }

    setIsWasherFound(false);
    setFoundWasher(null);
    setIsSearchingWasher(true);
    mapRef.current?.animateToRegion(
      {
        ...coords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      500
    );

    foundTimerRef.current = setTimeout(() => {
      setIsSearchingWasher(false);
      setIsWasherFound(true);
      setFoundWasher({ name: "Jean K.", eta: 7 });
      foundTimerRef.current = null;
    }, 5000);
  };

  const handleCancelSearch = () => {
    if (foundTimerRef.current) {
      clearTimeout(foundTimerRef.current);
      foundTimerRef.current = null;
    }
    setIsSearchingWasher(false);
    setIsWasherFound(false);
    setFoundWasher(null);
  };

  const handleNextStep = () => {
    if (stepIndex === 0) {
      setStepIndex(1);
      return;
    }
    if (stepIndex === 1) {
      setStepIndex(2);
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {!isSearchingWasher && !isWasherFound && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Reserver maintenant</Text>
            <Text style={styles.headerSubtitle}>Choisissez l&lsquo;emplacement et le service</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      )}

      <View style={styles.mapContainer}>
        {isLoadingLocation ? (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#4A6FFF" />
            <Text style={styles.placeholderText}>Localisation en cours...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            customMapStyle={MAP_STYLE}
            initialRegion={{
              ...coords,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass={false}
          >
            <Marker coordinate={coords} title="Emplacement" description={address}>
              <View style={styles.marker}>
                <MapPin size={18} color="#FFFFFF" />
              </View>
            </Marker>
            {isSearchingWasher && (
              <Marker coordinate={coords} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.pulseMarker}>
                  <Animated.View
                    style={[
                      styles.mapPulseRing,
                      {
                        transform: [
                          {
                            scale: pulseAnim.interpolate({
                              inputRange: [1, 1.15],
                              outputRange: [0.9, 1.4],
                            }),
                          },
                        ],
                        opacity: pulseAnim.interpolate({
                          inputRange: [1, 1.15],
                          outputRange: [0.35, 0],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.mapPulseRingLarge,
                      {
                        transform: [
                          {
                            scale: pulseAnim.interpolate({
                              inputRange: [1, 1.15],
                              outputRange: [0.7, 1.6],
                            }),
                          },
                        ],
                        opacity: pulseAnim.interpolate({
                          inputRange: [1, 1.15],
                          outputRange: [0.25, 0],
                        }),
                      },
                    ]}
                  />
                  <View style={styles.mapPulseCore} />
                </View>
              </Marker>
            )}
          </MapView>
        )}

        {(isSearchingWasher || isWasherFound) && (
          <View style={styles.mapStatusPill} pointerEvents="none">
            <View style={styles.mapStatusRow}>
              <View
                style={[
                  styles.mapStatusDot,
                  isWasherFound ? styles.mapStatusDotFound : styles.mapStatusDotSearching,
                ]}
              />
              <Text style={styles.mapStatusTitle}>
                {isWasherFound ? "Laveur trouve" : "Recherche de laveur"}
              </Text>
            </View>
            <Text style={styles.mapStatusSubtitle} numberOfLines={1}>
              {address}
            </Text>
          </View>
        )}

        {!isSearchingWasher && !isWasherFound && (
          <View style={styles.searchBox}>
            <View style={styles.searchInputRow}>
              <Search size={18} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une adresse"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {isSearching ? (
                <ActivityIndicator size="small" color="#4A6FFF" />
              ) : null}
            </View>
            {searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                style={styles.searchResults}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSelectSearch(item)}
                  >
                    <MapPin size={14} color="#4A6FFF" />
                    <Text style={styles.searchResultText} numberOfLines={2}>
                      {item.place_name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}

        {!isSearchingWasher && !isWasherFound && (
          <TouchableOpacity
            style={[styles.locationButton, { bottom: SHEET_EXPANDED_HEIGHT + 16 }]}
            onPress={handleUseCurrentLocation}
          >
            <Locate size={20} color="#4A6FFF" />
          </TouchableOpacity>
        )}

        {!isSearchingWasher && !isWasherFound && (
          <View
            style={[
              styles.bottomSheet,
              { height: SHEET_EXPANDED_HEIGHT },
            ]}
          >
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHandle} />
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>Etape {stepIndex + 1} / 3</Text>
                <View style={styles.stepDots}>
                  {[0, 1, 2].map((step) => (
                    <View
                      key={`step-${step}`}
                      style={[
                        styles.stepDot,
                        stepIndex >= step && styles.stepDotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.addressCard}>
                <Text style={styles.addressLabel}>Adresse de lavage</Text>
                <Text style={styles.addressValue} numberOfLines={2}>
                  {address || "Selectionnez une adresse"}
                </Text>
              </View>

              {stepIndex === 0 && (
                <>
                  <Text style={styles.sectionTitle}>Choisissez le type de vehicule</Text>
                  <View style={styles.vehicleRow}>
                    {VEHICLES.map((vehicle) => {
                      const isActive = vehicle.key === selectedVehicle;
                      return (
                        <TouchableOpacity
                          key={vehicle.key}
                          style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
                          onPress={() => updateUserData("selectedVehicle", vehicle.key)}
                        >
                        <View style={styles.vehicleIcon}>
                          <vehicle.icon width={70} height={45} />
                        </View>
                          <Text style={[styles.vehicleText, isActive && styles.vehicleTextActive]}>
                            {vehicle.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {stepIndex === 1 && (
                <>
                  <Text style={styles.sectionTitle}>Choisissez le type de lavage</Text>
                  <View style={styles.washList}>
                    {WASH_TYPES.map((wash) => {
                      const isActive = wash.key === selectedWashType;
                      return (
                        <TouchableOpacity
                          key={wash.key}
                          style={[styles.washCard, isActive && styles.washCardActive]}
                          onPress={() => updateUserData("selectedWashType", wash.key)}
                        >
                        <View style={styles.washIcon}>
                          <wash.icon width={64} height={64} />
                        </View>
                          <View style={styles.washBody}>
                            <View style={styles.washHeader}>
                              <Text style={styles.washTitle}>{wash.title}</Text>
                              <Text style={styles.washPrice}>{wash.price.toLocaleString()} F CFA</Text>
                            </View>
                            <Text style={styles.washDescription}>{wash.description}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {stepIndex === 2 && (
                <>
                  <View style={styles.summaryList}>
                    <View style={styles.summaryItem}>
                      <MapPin size={16} color="#4A6FFF" />
                      <Text style={styles.summaryText} numberOfLines={1}>
                        {address}
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Vehicule</Text>
                      <Text style={styles.summaryValue}>{selectedVehicle}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Lavage</Text>
                      <Text style={styles.summaryValue}>{selectedWash.title}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Prix</Text>
                      <Text style={styles.summaryValue}>
                        {selectedWash.price.toLocaleString()} F CFA
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.walletRow} activeOpacity={0.7}>
                    <ShieldCheck size={18} color="#4A6FFF" />
                    <Text style={styles.walletText}>
                      Solde du portefeuille : {walletBalance.toLocaleString()} F CFA
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.stepActions}>
                {stepIndex > 0 && (
                  <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevStep}>
                    <Text style={styles.secondaryButtonText}>Retour</Text>
                  </TouchableOpacity>
                )}
                {stepIndex < 2 ? (
                  <TouchableOpacity
                    style={[styles.primaryButton, !selectedVehicle && styles.primaryButtonDisabled]}
                    onPress={handleNextStep}
                    disabled={!selectedVehicle}
                  >
                    <Text style={styles.primaryButtonText}>Continuer</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.primaryButton, !selectedVehicle && styles.primaryButtonDisabled]}
                    onPress={handleRequest}
                    disabled={!selectedVehicle}
                  >
                    <Text style={styles.primaryButtonText}>Demander</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        )}

        {isSearchingWasher && (
          <View style={styles.searchOverlay}>
            <View style={styles.searchingCard}>
              <View style={styles.searchingHeader}>
                <Text style={styles.searchingTitle}>Recherche d&lsquo;un laveur a proximite...</Text>
                <Text style={styles.searchingTimer}>
                  {String(Math.floor(searchElapsed / 60)).padStart(2, '0')}:
                  {String(searchElapsed % 60).padStart(2, '0')}
                </Text>
              </View>
              <View style={styles.searchingRow}>
                <MapPin size={16} color="#4A6FFF" />
                <Text style={styles.searchingText} numberOfLines={1}>
                  {address}
                </Text>
              </View>
              <View style={styles.searchingRow}>
                <Text style={styles.searchingMeta}>{selectedVehicle}</Text>
                <Text style={styles.searchingMeta}>{selectedWash.title}</Text>
                <Text style={styles.searchingPrice}>
                  {selectedWash.price.toLocaleString()} F CFA
                </Text>
              </View>
              <TouchableOpacity style={styles.cancelButtonSheet} onPress={handleCancelSearch}>
                <Text style={styles.cancelButtonText}>Annuler la demande</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isWasherFound && foundWasher && (
          <View style={styles.searchOverlay}>
            <View style={styles.foundCard}>
              <View style={styles.foundHeader}>
                <Text style={styles.foundTitle}>Laveur trouve</Text>
                <Text style={styles.foundBadge}>ETA {foundWasher.eta} min</Text>
              </View>
              <Text style={styles.foundName}>{foundWasher.name}</Text>
              <Text style={styles.foundSubtitle}>Se dirige vers vous</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={handleCancelSearch}>
                <Text style={styles.primaryButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  headerSpacer: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPulseRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: "#4A6FFF",
    backgroundColor: "rgba(74, 111, 255, 0.08)",
  },
  mapPulseRingLarge: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: "#4A6FFF",
    backgroundColor: "rgba(74, 111, 255, 0.05)",
  },
  mapPulseCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4A6FFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  pulseMarker: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  mapStatusPill: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    maxWidth: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  mapStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  mapStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mapStatusDotSearching: {
    backgroundColor: "#4A6FFF",
  },
  mapStatusDotFound: {
    backgroundColor: "#22C55E",
  },
  mapStatusTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  mapStatusSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  placeholderText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 13,
  },
  marker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#4A6FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  searchBox: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  searchResults: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxHeight: 180,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sheetContent: {
    paddingBottom: 8,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  stepDots: {
    flexDirection: "row",
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  stepDotActive: {
    backgroundColor: "#4A6FFF",
  },
  searchResultText: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
  },
  locationButton: {
    position: "absolute",
    right: 16,
    bottom: 260,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetHeader: {
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
  },
  addressCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  vehicleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  vehicleCard: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 8,
  },
  vehicleCardActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#4A6FFF",
  },
  vehicleIcon: {
    marginBottom: 6,
  },
  vehicleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  vehicleTextActive: {
    color: "#4A6FFF",
  },
  washList: {
    gap: 10,
    marginBottom: 16,
  },
  washCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  washCardActive: {
    borderColor: "#4A6FFF",
    backgroundColor: "#F5F7FF",
  },
  washIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  washBody: {
    flex: 1,
  },
  washHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  washTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  washDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  washPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A6FFF",
  },
  summaryList: {
    gap: 10,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  walletText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  searchOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  searchingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  searchingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  searchingTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },
  searchingTimer: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4A6FFF",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  searchingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  searchingText: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  searchingMeta: {
    fontSize: 12,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  searchingPrice: {
    marginLeft: "auto",
    fontSize: 13,
    fontWeight: "800",
    color: "#4A6FFF",
  },
  cancelButtonSheet: {
    marginTop: 6,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#DC2626",
  },
  foundCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  foundHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  foundTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  foundBadge: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16A34A",
    backgroundColor: "#ECFDF3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  foundName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  foundSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
  },
  stepActions: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#4A6FFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
