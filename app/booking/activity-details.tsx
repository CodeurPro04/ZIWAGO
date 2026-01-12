import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Car, User, Clock, CheckCircle, XCircle, Calendar, ChevronLeft, Star } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  completed: { label: "Terminé", color: "#16A34A", bg: "#DCFCE7", icon: CheckCircle },
  pending: { label: "À venir", color: "#F59E0B", bg: "#FEF3C7", icon: Calendar },
  cancelled: { label: "Annulé", color: "#EF4444", bg: "#FEE2E2", icon: XCircle },
};

export default function ActivityDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const status = (params.status as string) || "completed";
  const title = (params.title as string) || "Lavage Premium";
  const vehicle = (params.vehicle as string) || "Renault Clio";
  const washer = (params.washer as string) || "Jean D.";
  const date = (params.date as string) || "Aujourd'hui, 14:30";
  const price = parseInt((params.price as string) || "0", 10);
  const rating = params.rating ? parseFloat(params.rating as string) : null;

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.completed;
  const StatusIcon = statusConfig.icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <StatusIcon size={16} color={statusConfig.color} />
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
          <Text style={styles.statusTitle}>{title}</Text>
          <Text style={styles.statusSubtitle}>{date}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoRow}>
            <Car size={16} color={Colors.primary} />
            <Text style={styles.infoText}>{vehicle}</Text>
          </View>
          <View style={styles.infoRow}>
            <User size={16} color={Colors.primary} />
            <Text style={styles.infoText}>{washer}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={16} color={Colors.primary} />
            <Text style={styles.infoText}>{date}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paiement</Text>
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Total payé</Text>
            <Text style={styles.priceValue}>{price.toLocaleString()} F CFA</Text>
          </View>
        </View>

        {rating ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votre note</Text>
            <View style={styles.ratingCard}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.rateButton}>
            <Star size={16} color="#F59E0B" />
            <Text style={styles.rateText}>Évaluer le service</Text>
          </TouchableOpacity>
        )}
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
    paddingTop: Spacing.sm,
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
  statusCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  statusSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.heading,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "600",
  },
  priceCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  ratingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "#FEF3C7",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F59E0B",
  },
  rateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "#FEF3C7",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  rateText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F59E0B",
  },
});
