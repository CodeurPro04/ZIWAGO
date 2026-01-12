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
} from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import {
  ChevronLeft,
  Locate,
  MapPin,
  Search,
  CheckCircle,
  Clock,
  ShieldCheck,
} from "lucide-react-native";
import { useUserStore } from "@/hooks/useUserData";

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
const SHEET_COLLAPSED_HEIGHT = 170;

const VEHICLES = [
  { key: "Berline", label: "Berline" },
  { key: "Compacte", label: "Compacte" },
  { key: "SUV", label: "SUV" },
];

const WASH_TYPES = [
  {
    key: "exterior",
    title: "Extérieur uniquement",
    description: "Carrosserie, vitres et pneus",
    duration: "20 min",
    price: 2000,
  },
  {
    key: "interior",
    title: "Intérieur uniquement",
    description: "Sièges, tapis et tableau de bord",
    duration: "30 min",
    price: 2500,
  },
  {
    key: "complete",
    title: "Lavage complet",
    description: "Extérieur + intérieur complets",
    duration: "45 min",
    price: 4000,
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
  const [sheetExpanded, setSheetExpanded] = useState(true);

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

    router.push({
      pathname: "/booking/searching",
      params: {
        address: encodeURIComponent(address),
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
        vehicle: encodeURIComponent(selectedVehicle),
        washType: encodeURIComponent(selectedWash.title),
        price: selectedWash.price.toString(),
        duration: selectedWash.duration,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Réserver maintenant</Text>
          <Text style={styles.headerSubtitle}>Choisissez l'emplacement et le service</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

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
          </MapView>
        )}

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

        <TouchableOpacity
          style={[
            styles.locationButton,
            { bottom: sheetExpanded ? SHEET_EXPANDED_HEIGHT + 16 : SHEET_COLLAPSED_HEIGHT + 16 },
          ]}
          onPress={handleUseCurrentLocation}
        >
          <Locate size={20} color="#4A6FFF" />
        </TouchableOpacity>

        <View style={[styles.bottomSheet, { height: sheetExpanded ? SHEET_EXPANDED_HEIGHT : SHEET_COLLAPSED_HEIGHT }]}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <TouchableOpacity
              style={styles.sheetToggle}
              onPress={() => setSheetExpanded((prev) => !prev)}
            >
              <Text style={styles.sheetToggleText}>
                {sheetExpanded ? "Voir la carte" : "Voir les options"}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.addressCard}>
              <Text style={styles.addressLabel}>Adresse de lavage</Text>
              <Text style={styles.addressValue} numberOfLines={2}>
                {address || "Sélectionnez une adresse"}
              </Text>
            </View>

            {sheetExpanded && (
              <>
                <Text style={styles.sectionTitle}>Type de véhicule</Text>
                <View style={styles.vehicleRow}>
                  {VEHICLES.map((vehicle) => {
                    const isActive = vehicle.key === selectedVehicle;
                    return (
                      <TouchableOpacity
                        key={vehicle.key}
                        style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
                        onPress={() => updateUserData("selectedVehicle", vehicle.key)}
                      >
                        <Text style={[styles.vehicleText, isActive && styles.vehicleTextActive]}>
                          {vehicle.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.sectionTitle}>Type de lavage</Text>
                <View style={styles.washList}>
                  {WASH_TYPES.map((wash) => {
                    const isActive = wash.key === selectedWashType;
                    return (
                      <TouchableOpacity
                        key={wash.key}
                        style={[styles.washCard, isActive && styles.washCardActive]}
                        onPress={() => updateUserData("selectedWashType", wash.key)}
                      >
                        <View style={styles.washHeader}>
                          <Text style={styles.washTitle}>{wash.title}</Text>
                          {isActive && (
                            <View style={styles.washCheck}>
                              <CheckCircle size={16} color="#4A6FFF" />
                            </View>
                          )}
                        </View>
                        <Text style={styles.washDescription}>{wash.description}</Text>
                        <View style={styles.washMeta}>
                          <Clock size={12} color="#6B7280" />
                          <Text style={styles.washMetaText}>{wash.duration}</Text>
                          <Text style={styles.washPrice}>{wash.price.toLocaleString()} F CFA</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.securityNote}>
                  <ShieldCheck size={16} color="#22C55E" />
                  <Text style={styles.securityText}>Paiement sécurisé • Satisfaction garantie</Text>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                !selectedVehicle && styles.primaryButtonDisabled,
              ]}
              onPress={handleRequest}
              disabled={!selectedVehicle}
            >
              <Text style={styles.primaryButtonText}>Rechercher un laveur</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
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
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
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
  sheetToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
  },
  sheetToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A6FFF",
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
  },
  vehicleCardActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#4A6FFF",
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
  washCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  washDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  washMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  washMetaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  washPrice: {
    marginLeft: "auto",
    fontSize: 13,
    fontWeight: "700",
    color: "#4A6FFF",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF3",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22C55E",
  },
  primaryButton: {
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
