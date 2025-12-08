import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Bookmark, Map } from "lucide-react-native";
import { Input } from "@/components/Input";
import { useUserStore } from "@/hooks/useUserData";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";

export default function LocationScreen() {
  const router = useRouter();
  const { updateUserData } = useUserStore();

  const savedLocations = [
    {
      name: "Riviera 2 - Carrefour Duncan",
      address: "Riviera 2, Cocody, Abidjan",
    },
    {
      name: "Zone 4C - Rue du Canal",
      address: "Zone 4, Marcory, Abidjan",
    },
  ];

  const handleSelectLocation = (location: string) => {
    updateUserData("selectedLocation", location);
    router.push("/booking/wash-type");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emplacement de la voiture</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Input
          icon={<MapPin size={20} color={Colors.textSecondary} />}
          placeholder="Où est garée la voiture ?"
          style={styles.searchInput}
        />

        <View style={styles.locationButtons}>
          <TouchableOpacity style={styles.locationButton} activeOpacity={0.7}>
            <Bookmark size={20} color={Colors.primary} />
            <Text style={styles.locationButtonText}>
              Emplacements enregistrés
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.locationButton}
            activeOpacity={0.7}
            onPress={() => router.push("/booking/vehicle-selection")}
          >
            <Map size={20} color={Colors.primary} />
            <Text style={styles.locationButtonText}>Choisir sur la carte</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Lieux récents</Text>

        {savedLocations.map((location, index) => (
          <TouchableOpacity
            key={index}
            style={styles.savedLocation}
            onPress={() => handleSelectLocation(location.name)}
            activeOpacity={0.7}
          >
            <MapPin size={24} color={Colors.textSecondary} />
            <View style={styles.savedLocationInfo}>
              <Text style={styles.savedLocationTitle}>{location.name}</Text>
              <Text style={styles.savedLocationAddress}>
                {location.address}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    fontSize: 28,
    marginRight: Spacing.md,
    color: Colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  searchInput: {
    marginBottom: Spacing.lg,
  },
  locationButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  locationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  sectionTitle: {
    ...Typography.heading,
    marginBottom: Spacing.md,
  },
  savedLocation: {
    flexDirection: "row",
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  savedLocationInfo: {
    flex: 1,
  },
  savedLocationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  savedLocationAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
