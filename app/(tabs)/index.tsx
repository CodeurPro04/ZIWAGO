import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
  MapPin,
  Calendar,
  Zap,
  ChevronRight,
  Star,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";
import CarFrontIcon from "@/assets/images/car1front.svg";
import timemanage from "@/assets/images/timemanage.svg";
import * as Location from "expo-location";
import { useUserStore } from "@/hooks/useUserData";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";

const QUICK_ACTIONS = [
  {
    id: "instant",
    title: "Réserver maintenant",
    subtitle: "Un laveur arrive tout de suite",
    icon: CarFrontIcon,
    action: "/booking/vehicle-selection",
    tone: "#4A6FFF",
  },
  {
    id: "schedule",
    title: "Programmer",
    subtitle: "Choisissez un créneau",
    icon: timemanage,
    action: "/booking/schedule",
    tone: "#0EA5E9",
  },
];

const SERVICE_CARDS = [
  {
    id: "premium",
    title: "Lavage Complet",
    subtitle: "Extérieur + intérieur",
    price: "4 000 F",
    image: require("@/assets/images/complet.jpg"),
  },
  {
    id: "interior",
    title: "Intérieur uniquement",
    subtitle: "Sièges, tapis, tableau",
    price: "2 500 F",
    image: require("@/assets/images/interieur.jpg"),
  },
];

const OFFERS = [
  {
    id: "eco",
    title: "Pack Éco",
    subtitle: "Idéal pour les trajets du quotidien",
    price: "1 800 F",
  },
  {
    id: "pro",
    title: "Pack Pro",
    subtitle: "Lavage complet + finitions",
    price: "4 500 F",
  },
  {
    id: "express",
    title: "Express 20 min",
    subtitle: "Rapide et efficace",
    price: "2 200 F",
  },
];

const HIGHLIGHTS = [
  {
    id: "secure",
    title: "Paiement sécurisé",
    description: "Transactions protégées",
    icon: ShieldCheck,
  },
  {
    id: "fast",
    title: "Arrivée rapide",
    description: "Laveur en quelques minutes",
    icon: Zap,
  },
  {
    id: "quality",
    title: "Qualité premium",
    description: "Matériel pro et produits sûrs",
    icon: Star,
  },
];

const TIPS = [
  {
    id: "tip-1",
    title: "Préparez votre véhicule",
    subtitle: "Retirez les objets personnels",
  },
  {
    id: "tip-2",
    title: "Choisissez un créneau calme",
    subtitle: "Meilleure disponibilité des laveurs",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const {
    firstName,
    lastName,
    selectedLocation,
    selectedLocationCoords,
    updateUserData,
  } = useUserStore();
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadLocation = async () => {
      try {
        if (selectedLocationCoords) {
          if (isMounted) {
            setIsLocationLoading(false);
          }
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (isMounted) {
            setLocationError("Permission refusée");
            setIsLocationLoading(false);
          }
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        const [placemark] = await Location.reverseGeocodeAsync(coords);
        const addressParts = [
          placemark.street,
          placemark.district,
          placemark.city,
        ].filter(Boolean);
        const formattedAddress =
          addressParts.length > 0
            ? addressParts.join(", ")
            : "Position actuelle";

        updateUserData("selectedLocation", formattedAddress);
        updateUserData("selectedLocationCoords", coords);

        if (isMounted) {
          setLocationError(null);
          setIsLocationLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setLocationError("Localisation indisponible");
          setIsLocationLoading(false);
        }
      }
    };

    loadLocation();
    return () => {
      isMounted = false;
    };
  }, [updateUserData, selectedLocationCoords]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Bonjour{firstName ? `, ${firstName} ${lastName}` : ""} !
            </Text>
            <Text style={styles.subGreeting}>
              Prêt pour un lavage impeccable ?
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.locationCard}
          onPress={() => router.push("/booking/location")}
          activeOpacity={0.7}
        >
          <View style={styles.locationIcon}>
            <MapPin size={18} color={Colors.primary} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Emplacement actuel</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {isLocationLoading
                ? "Localisation en cours..."
                : locationError
                  ? locationError
                  : selectedLocation}
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Votre voiture, toujours impeccable.
            </Text>
            <Text style={styles.heroSubtitle}>
              Réservez un laveur en quelques secondes, où que vous soyez à
              Abidjan.
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => router.push("/booking/vehicle-selection")}
            >
              <Text style={styles.heroButtonText}>Démarrer</Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
        </View>
        <View style={styles.actionsRow}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { borderColor: `${action.tone}30` }]}
              onPress={() => router.push(action.action)}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <action.icon width={80} height={80} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Offers Section
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Offres du moment</Text>
          <TouchableOpacity onPress={() => router.push("/booking/vehicle-selection")}>
            <Text style={styles.sectionLink}>Découvrir</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offersRow}
        >
          {OFFERS.map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
              <Text style={styles.offerPrice}>{offer.price}</Text>
            </View>
          ))}
        </ScrollView>  */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pourquoi Ziwago</Text>
        </View>
        <View style={styles.highlightRow}>
          {HIGHLIGHTS.map((item) => (
            <View key={item.id} style={styles.highlightCard}>
              <View style={styles.highlightIcon}>
                <item.icon size={18} color={Colors.primary} />
              </View>
              <Text style={styles.highlightTitle}>{item.title}</Text>
              <Text style={styles.highlightSubtitle}>{item.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
  },
  subGreeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  heroCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    overflow: "hidden",
  },
  heroContent: {
    gap: Spacing.sm,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
  },
  heroButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.heading,
    marginBottom: 0,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  actionCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    alignItems: "center",
  },
  actionIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  serviceCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceImage: {
    width: 90,
    height: 90,
  },
  serviceInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "center",
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  offersRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  offerCard: {
    width: 180,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  offerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  offerPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  highlightRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  highlightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  highlightSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  tipSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bottomSpacer: {
    height: 80,
  },
});
