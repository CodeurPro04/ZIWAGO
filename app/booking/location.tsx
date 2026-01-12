import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Locate, Search, ChevronLeft, CheckCircle } from "lucide-react-native";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "@/hooks/useUserData";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";

type SearchResult = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

const RECENTS_STORAGE_KEY = "ziwago.recentLocations";

export default function LocationScreen() {
  const router = useRouter();
  const { selectedLocation, selectedLocationCoords, updateUserData } = useUserStore();
  const [query, setQuery] = useState(selectedLocation || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [previewCoords, setPreviewCoords] = useState(
    selectedLocationCoords || { latitude: 5.3364, longitude: -4.0267 }
  );
  const [recentLocations, setRecentLocations] = useState<SearchResult[]>([]);
  const [isClearingRecents, setIsClearingRecents] = useState(false);
  const orderedRecents = useMemo(() => {
    if (!selectedLocation) return recentLocations;
    const current = recentLocations.find((item) => item.label === selectedLocation);
    const rest = recentLocations.filter((item) => item.label !== selectedLocation);
    return current ? [current, ...rest] : recentLocations;
  }, [recentLocations, selectedLocation]);

  useEffect(() => {
    setQuery(selectedLocation || "");
    if (selectedLocationCoords) {
      setPreviewCoords(selectedLocationCoords);
    }
  }, [selectedLocation, selectedLocationCoords]);

  useEffect(() => {
    const loadRecents = async () => {
      try {
        const stored = await AsyncStorage.getItem(RECENTS_STORAGE_KEY);
        if (stored) {
          setRecentLocations(JSON.parse(stored));
        }
      } catch (error) {
        setRecentLocations([]);
      }
    };
    loadRecents();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const handle = setTimeout(() => {
      searchLocation(query);
    }, 400);

    return () => clearTimeout(handle);
  }, [query]);

  const searchLocation = async (text: string) => {
    try {
      setIsSearching(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=ci&addressdetails=1&limit=6`,
        {
          headers: { "User-Agent": "ZIWAGO/1.0" },
        }
      );
      const data = await response.json();
      const mapped = (data || []).map((item: any) => ({
        id: item.place_id?.toString() || item.osm_id?.toString(),
        label: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));
      setResults(mapped);
    } catch (error) {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const saveRecentLocation = async (item: SearchResult) => {
    const next = [
      item,
      ...recentLocations.filter((loc) => loc.label !== item.label),
    ].slice(0, 5);
    setRecentLocations(next);
    try {
      await AsyncStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      // ignore storage errors
    }
  };

  const handleSelect = (item: SearchResult) => {
    updateUserData("selectedLocation", item.label);
    updateUserData("selectedLocationCoords", {
      latitude: item.latitude,
      longitude: item.longitude,
    });
    saveRecentLocation(item);
    Keyboard.dismiss();
    router.replace("/(tabs)");
  };

  const handleUseCurrent = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setIsLocating(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1`,
        {
          headers: { "User-Agent": "ZIWAGO/1.0" },
        }
      );
      const data = await response.json();
      const address = data.display_name || "Current location";

      updateUserData("selectedLocation", address);
      updateUserData("selectedLocationCoords", coords);
      setQuery(address);
      saveRecentLocation({
        id: `current-${Date.now()}`,
        label: address,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      router.replace("/(tabs)");
    } catch (error) {
      setIsLocating(false);
    } finally {
      setIsLocating(false);
    }
  };

  const handleConfirmManual = () => {
    if (!query.trim()) return;
    updateUserData("selectedLocation", query.trim());
    updateUserData("selectedLocationCoords", null);
    saveRecentLocation({
      id: `manual-${Date.now()}`,
      label: query.trim(),
      latitude: 0,
      longitude: 0,
    });
    router.replace("/(tabs)");
  };

  const handleClearRecents = async () => {
    setIsClearingRecents(true);
    setRecentLocations([]);
    try {
      await AsyncStorage.removeItem(RECENTS_STORAGE_KEY);
    } catch (error) {
      // ignore
    } finally {
      setIsClearingRecents(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emplacement du vehicule</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.mapCard}>
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.miniMap}
            region={{
              ...previewCoords,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={() => router.push("/booking/vehicle-selection")}
          >
            <Marker coordinate={previewCoords}>
              <View style={styles.miniMarker}>
                <MapPin size={16} color="#FFFFFF" />
              </View>
            </Marker>
          </MapView>
          <View style={styles.mapOverlay}>
            <Text style={styles.mapTitle} numberOfLines={2}>
              {selectedLocation || "Selectionnez une adresse"}
            </Text>
            <Text style={styles.mapSubtitle}>Touchez pour ouvrir la carte</Text>
          </View>
        </View>

        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <Search size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une adresse en Cote d'Ivoire"
              placeholderTextColor={Colors.textSecondary}
              value={query}
              onChangeText={setQuery}
            />
            {isSearching ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
          </View>

          {results.length > 0 && (
            <View style={styles.resultsBox}>
              {results.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.resultItem}
                  onPress={() => handleSelect(item)}
                >
                  <MapPin size={16} color={Colors.primary} />
                  <Text style={styles.resultText} numberOfLines={2}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleUseCurrent}>
            {isLocating ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Locate size={18} color={Colors.primary} />
            )}
            <Text style={styles.actionText}>Utiliser ma position</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/booking/vehicle-selection")}
          >
            <MapPin size={18} color={Colors.primary} />
            <Text style={styles.actionText}>Choisir sur la carte</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmManual}>
          <CheckCircle size={18} color="#FFFFFF" />
          <Text style={styles.confirmText}>Confirmer l'emplacement</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emplacements recents</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearRecents}
            disabled={isClearingRecents || recentLocations.length === 0}
          >
            {isClearingRecents ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.clearText}>Effacer</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.recentsList}>
          {orderedRecents.length === 0 ? (
            <View style={styles.emptyRecents}>
              <Text style={styles.emptyRecentsText}>Aucun emplacement recent</Text>
            </View>
          ) : null}
          {orderedRecents.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentCard}
              onPress={() => {
                if (item.latitude && item.longitude) {
                  handleSelect(item);
                } else {
                  updateUserData("selectedLocation", item.label);
                  updateUserData("selectedLocationCoords", null);
                  saveRecentLocation(item);
                  router.replace("/(tabs)");
                }
              }}
            >
              {item.label === selectedLocation ? (
                <View style={styles.currentPin}>
                  <MapPin size={12} color="#FFFFFF" />
                </View>
              ) : (
                <MapPin size={16} color={Colors.textSecondary} />
              )}
              <Text style={styles.recentText} numberOfLines={2}>
                {item.label}
              </Text>
              {item.label === selectedLocation ? (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Actuel</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  mapCard: {
    height: 160,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  miniMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  mapOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  mapSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  searchCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  resultsBox: {
    marginTop: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
  },
  quickActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sectionTitle: {
    ...Typography.heading,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  clearButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  recentsList: {
    gap: Spacing.sm,
  },
  emptyRecents: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyRecentsText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
  },
  currentPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  currentBadge: {
    backgroundColor: Colors.secondary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.primary,
  },
});
