import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
  StatusBar,
  Platform,
} from "react-native";
import {
  User,
  MapPin,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Star,
  Shield,
  Globe,
  Moon,
  CreditCard,
  FileText,
  Heart,
  Share2,
  Edit2,
  Camera,
  Lock,
  Sparkles,
  X,
} from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";

type DetailView = "profile" | "addresses" | "payment" | "security" | "help" | "terms" | "privacy" | "share" | "rate" | null;

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeSection, setActiveSection] = useState<"account" | "preferences" | "support">("account");
  const [detailView, setDetailView] = useState<DetailView>(null);

  const user = {
    firstName: "John",
    lastName: "Doe",
    phone: "+225 07 00 12 34 56",
    email: "john.doe@example.com",
    joinDate: "15 mars 2024",
    membership: "Premium",
    rating: 4.8,
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=4A6FA5&color=fff&size=150",
    bio: "Passionné de voitures propres et de services de qualité.",
  };

  const stats = {
    totalOrders: 24,
    totalSpent: 125400,
    loyaltyPoints: 1250,
  };

  const addresses = [
    { id: "addr-1", label: "Maison", detail: "Riviera 2, Cocody" },
    { id: "addr-2", label: "Bureau", detail: "Plateau, Abidjan" },
  ];

  const payments = [
    { id: "pay-1", label: "Wave", detail: "**** 1122" },
    { id: "pay-2", label: "Orange Money", detail: "**** 7845" },
    { id: "pay-3", label: "Carte bancaire", detail: "**** 4321" },
  ];

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    locationAccess: true,
    biometrics: true,
    marketingEmails: false,
    soundEffects: true,
  });

  const accountItems = useMemo(
    () => [
      { id: "profile", icon: User, title: "Informations personnelles", subtitle: "Nom, téléphone, email" },
      { id: "addresses", icon: MapPin, title: "Adresses enregistrées", subtitle: "Maison, bureau", badge: addresses.length },
      { id: "payment", icon: CreditCard, title: "Moyens de paiement", subtitle: "Mobile money, carte", badge: payments.length },
      { id: "security", icon: Shield, title: "Sécurité", subtitle: "Mot de passe et biométrie" },
    ],
    [addresses.length, payments.length]
  );

  const preferenceItems = [
    { id: "notifications", icon: Bell, title: "Notifications", value: settings.notifications },
    { id: "darkMode", icon: Moon, title: "Mode sombre", value: settings.darkMode },
    { id: "locationAccess", icon: Globe, title: "Localisation", value: settings.locationAccess },
    { id: "biometrics", icon: Shield, title: "Authentification biométrique", value: settings.biometrics },
    { id: "marketingEmails", icon: Mail, title: "Emails marketing", value: settings.marketingEmails },
    { id: "soundEffects", icon: Bell, title: "Effets sonores", value: settings.soundEffects },
  ];

  const supportItems = [
    { id: "help", icon: HelpCircle, title: "Centre d'aide" },
    { id: "terms", icon: FileText, title: "Conditions d'utilisation" },
    { id: "privacy", icon: Shield, title: "Politique de confidentialité" },
    { id: "share", icon: Share2, title: "Inviter des amis" },
    { id: "rate", icon: Star, title: "Évaluer l'application" },
  ];

  const handleToggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <User size={24} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Vous êtes déconnecté</Text>
          <Text style={styles.emptySubtitle}>Connectez-vous pour accéder à votre profil.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setIsLoggedIn(true)}>
            <Text style={styles.primaryButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Settings size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Camera size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
                <TouchableOpacity onPress={() => setDetailView("profile")}>
                  <Edit2 size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.badge}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.badgeText}>{user.membership}</Text>
              </View>
              <Text style={styles.bio}>{user.bio}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalOrders}</Text>
                  <Text style={styles.statLabel}>Commandes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.rating}</Text>
                  <Text style={styles.statLabel}>Note</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.loyaltyPoints}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <Phone size={16} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{user.phone}</Text>
            </View>
            <View style={styles.contactRow}>
              <Mail size={16} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{user.email}</Text>
            </View>
            <View style={styles.contactRow}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.contactText}>Membre depuis {user.joinDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionNav}>
          <TouchableOpacity
            style={[styles.sectionBtn, activeSection === "account" && styles.sectionBtnActive]}
            onPress={() => setActiveSection("account")}
          >
            <Text style={[styles.sectionText, activeSection === "account" && styles.sectionTextActive]}>Compte</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sectionBtn, activeSection === "preferences" && styles.sectionBtnActive]}
            onPress={() => setActiveSection("preferences")}
          >
            <Text style={[styles.sectionText, activeSection === "preferences" && styles.sectionTextActive]}>Préférences</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sectionBtn, activeSection === "support" && styles.sectionBtnActive]}
            onPress={() => setActiveSection("support")}
          >
            <Text style={[styles.sectionText, activeSection === "support" && styles.sectionTextActive]}>Support</Text>
          </TouchableOpacity>
        </View>

        {activeSection === "account" && (
          <View style={styles.menuSection}>
            {accountItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => setDetailView(item.id as DetailView)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <item.icon size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuText}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  {item.badge ? (
                    <View style={styles.menuBadge}>
                      <Text style={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <ChevronRight size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeSection === "preferences" && (
          <View style={styles.menuSection}>
            {preferenceItems.map((item) => (
              <View key={item.id} style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <item.icon size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={() => handleToggleSetting(item.id as keyof typeof settings)}
                  trackColor={{ false: "#D1D5DB", true: Colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        )}

        {activeSection === "support" && (
          <View style={styles.menuSection}>
            {supportItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => setDetailView(item.id as DetailView)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <item.icon size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <ChevronRight size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
          <Text style={styles.version}>Ziwago v1.0.0</Text>
        </View>
      </ScrollView>

      <Modal transparent visible={detailView !== null} animationType="slide" onRequestClose={() => setDetailView(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setDetailView(null)}>
                <X size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {detailView === "profile" && (
              <View style={styles.modalBlock}>
                <Text style={styles.modalLabel}>Nom</Text>
                <Text style={styles.modalValue}>{user.firstName} {user.lastName}</Text>
                <Text style={styles.modalLabel}>Téléphone</Text>
                <Text style={styles.modalValue}>{user.phone}</Text>
                <Text style={styles.modalLabel}>Email</Text>
                <Text style={styles.modalValue}>{user.email}</Text>
              </View>
            )}

            {detailView === "addresses" && (
              <View style={styles.modalBlock}>
                {addresses.map((address) => (
                  <View key={address.id} style={styles.modalRow}>
                    <MapPin size={16} color={Colors.primary} />
                    <View>
                      <Text style={styles.modalValue}>{address.label}</Text>
                      <Text style={styles.modalHint}>{address.detail}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {detailView === "payment" && (
              <View style={styles.modalBlock}>
                {payments.map((payment) => (
                  <View key={payment.id} style={styles.modalRow}>
                    <CreditCard size={16} color={Colors.primary} />
                    <View>
                      <Text style={styles.modalValue}>{payment.label}</Text>
                      <Text style={styles.modalHint}>{payment.detail}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {detailView === "security" && (
              <View style={styles.modalBlock}>
                <View style={styles.modalRow}>
                  <Lock size={16} color={Colors.primary} />
                  <Text style={styles.modalValue}>Mot de passe</Text>
                </View>
                <View style={styles.modalRow}>
                  <Shield size={16} color={Colors.primary} />
                  <Text style={styles.modalValue}>Authentification biométrique</Text>
                </View>
              </View>
            )}

            {detailView === "help" && (
              <View style={styles.modalBlock}>
                <Text style={styles.modalValue}>Besoin d'aide ? Contactez notre support.</Text>
              </View>
            )}
            {detailView === "terms" && (
              <View style={styles.modalBlock}>
                <Text style={styles.modalValue}>Conditions d'utilisation disponibles ici.</Text>
              </View>
            )}
            {detailView === "privacy" && (
              <View style={styles.modalBlock}>
                <Text style={styles.modalValue}>Politique de confidentialité disponible ici.</Text>
              </View>
            )}
            {detailView === "share" && (
              <View style={styles.modalBlock}>
                <Text style={styles.modalValue}>Partagez votre code promo ZIWAGO.</Text>
              </View>
            )}
            {detailView === "rate" && (
              <View style={styles.modalBlock}>
                <Text style={styles.modalValue}>Merci pour votre soutien. Laissez une note !</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: Spacing.lg,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.lg,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "500",
  },
  bio: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  contactCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
  },
  sectionNav: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  sectionBtnActive: {
    backgroundColor: Colors.primary,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  sectionTextActive: {
    color: "#FFFFFF",
  },
  menuSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "600",
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuBadge: {
    backgroundColor: Colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  logoutSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#EF444440",
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 15,
    color: "#EF4444",
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBlock: {
    gap: Spacing.sm,
  },
  modalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  modalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  modalHint: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
});
