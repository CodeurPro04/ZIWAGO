import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  History,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Smartphone,
  X,
} from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useUserStore } from "@/hooks/useUserData";

const QUICK_ACTIONS = [
  { id: "topup", label: "Recharger", icon: Plus, tone: "#22C55E" },
  { id: "withdraw", label: "Retirer", icon: ArrowUpRight, tone: "#0EA5E9" },
  { id: "history", label: "Historique", icon: History, tone: "#F59E0B" },
];

const PAYMENT_METHODS = [
  { id: "wave", label: "Wave", detail: "**** 1122", color: "#2D5BFF" },
  { id: "orange", label: "Orange Money", detail: "**** 7845", color: "#FF6B35" },
  { id: "mtn", label: "MTN Money", detail: "**** 9231", color: "#FACC15" },
  { id: "moov", label: "Moov Money", detail: "**** 5566", color: "#22C55E" },
  { id: "card", label: "Carte bancaire", detail: "**** 4321", color: "#4A6FFF" },
];

const formatNow = () => {
  const date = new Date();
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `Aujourd'hui, ${time}`;
};

const sanitizeAmount = (value: string) => value.replace(/[^\d]/g, "");

export default function WalletScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showTopup, setShowTopup] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const walletBalance = useUserStore((state) => state.walletBalance);
  const updateUserData = useUserStore((state) => state.updateUserData);
  const walletTransactions = useUserStore((state) => state.walletTransactions);
  const addWalletTransaction = useUserStore((state) => state.addWalletTransaction);

  const stats = useMemo(() => {
    const totalIn = walletTransactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalOut = walletTransactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIn, totalOut };
  }, [walletTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const openModal = (type: "topup" | "withdraw") => {
    setAmount("");
    setSelectedMethod(PAYMENT_METHODS[0].id);
    if (type === "topup") setShowTopup(true);
    if (type === "withdraw") setShowWithdraw(true);
  };

  const handleTopup = () => {
    const numeric = parseInt(sanitizeAmount(amount), 10);
    if (!numeric || numeric <= 0) return;

    const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
    const title = method ? `Recharge ${method.label}` : "Recharge";

    updateUserData("walletBalance", walletBalance + numeric);
    addWalletTransaction({
      id: `topup-${Date.now()}`,
      type: "credit",
      title,
      date: formatNow(),
      amount: numeric,
    });
    setShowTopup(false);
  };

  const handleWithdraw = () => {
    const numeric = parseInt(sanitizeAmount(amount), 10);
    if (!numeric || numeric <= 0) return;
    if (numeric > walletBalance) return;

    const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
    const title = method ? `Retrait ${method.label}` : "Retrait";

    updateUserData("walletBalance", walletBalance - numeric);
    addWalletTransaction({
      id: `withdraw-${Date.now()}`,
      type: "debit",
      title,
      date: formatNow(),
      amount: numeric,
    });
    setShowWithdraw(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Portefeuille</Text>
            <Text style={styles.subtitle}>Gérez votre solde en toute simplicité</Text>
          </View>
          <TouchableOpacity style={styles.headerAction}>
            <ShieldCheck size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={["#4A6FFF", "#2D5BFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
          </View>
          <Text style={styles.balanceValue}>{walletBalance.toLocaleString()} F CFA</Text>
          <View style={styles.balanceRow}
          >
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Entrées</Text>
              <Text style={styles.balanceStatValue}>{stats.totalIn.toLocaleString()} F</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Sorties</Text>
              <Text style={styles.balanceStatValue}>{stats.totalOut.toLocaleString()} F</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
        </View>
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => {
                if (action.id === "history") return;
                openModal(action.id as "topup" | "withdraw");
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.tone}20` }]}
              >
                <action.icon size={18} color={action.tone} />
              </View>
              <Text style={styles.quickActionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Moyens de paiement</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Gérer</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.methodsList}>
          {PAYMENT_METHODS.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <View style={[styles.methodIcon, { backgroundColor: method.color }]}
              >
                <CreditCard size={16} color="#FFFFFF" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>{method.label}</Text>
                <Text style={styles.methodSubtitle}>{method.detail}</Text>
              </View>
              <ChevronRight size={16} color={Colors.textSecondary} />
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dernières transactions</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        {walletTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionCard}>
            <View
              style={[
                styles.transactionIcon,
                transaction.type === "credit" ? styles.creditIcon : styles.debitIcon,
              ]}
            >
              {transaction.type === "credit" ? (
                <ArrowDownLeft size={16} color="#16A34A" />
              ) : (
                <ArrowUpRight size={16} color="#EF4444" />
              )}
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>{transaction.title}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                transaction.type === "credit" ? styles.creditAmount : styles.debitAmount,
              ]}
            >
              {transaction.type === "credit" ? "+" : "-"}
              {transaction.amount.toLocaleString()} F
            </Text>
          </View>
        ))}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={showTopup}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTopup(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recharger</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowTopup(false)}>
                <X size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Ajoutez des fonds en quelques secondes.</Text>
            <Text style={styles.modalLabel}>Montant</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currency}>F CFA</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={amount}
                onChangeText={(value) => setAmount(sanitizeAmount(value))}
              />
            </View>
            <Text style={styles.modalLabel}>Méthode de paiement</Text>
            <View style={styles.methodsGrid}>
              {PAYMENT_METHODS.map((method) => {
                const isActive = selectedMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[styles.methodOption, isActive && styles.methodOptionActive]}
                    onPress={() => setSelectedMethod(method.id)}
                  >
                    <View style={[styles.methodOptionIcon, { backgroundColor: method.color }]}
                    >
                      <Smartphone size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.methodOptionText}>{method.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.modalPrimaryButton} onPress={handleTopup}>
              <Text style={styles.modalPrimaryText}>Recharger le portefeuille</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showWithdraw}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWithdraw(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Retirer</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowWithdraw(false)}>
                <X size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Transférez vers votre compte mobile.</Text>
            <Text style={styles.modalLabel}>Montant</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currency}>F CFA</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={amount}
                onChangeText={(value) => setAmount(sanitizeAmount(value))}
              />
            </View>
            <Text style={styles.modalLabel}>Méthode de retrait</Text>
            <View style={styles.methodsGrid}>
              {PAYMENT_METHODS.map((method) => {
                const isActive = selectedMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[styles.methodOption, isActive && styles.methodOptionActive]}
                    onPress={() => setSelectedMethod(method.id)}
                  >
                    <View style={[styles.methodOptionIcon, { backgroundColor: method.color }]}
                    >
                      <Smartphone size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.methodOptionText}>{method.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[
                styles.modalPrimaryButton,
                walletBalance < parseInt(sanitizeAmount(amount), 10) && styles.modalPrimaryDisabled,
              ]}
              onPress={handleWithdraw}
              disabled={walletBalance < parseInt(sanitizeAmount(amount), 10)}
            >
              <Text style={styles.modalPrimaryText}>Confirmer le retrait</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  balanceLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  balanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  balanceBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  balanceValue: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  balanceStat: {
    flex: 1,
  },
  balanceStatLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  balanceStatValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  balanceDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
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
  quickActionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  methodsList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  methodSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  creditIcon: {
    backgroundColor: "#DCFCE7",
  },
  debitIcon: {
    backgroundColor: "#FEE2E2",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: "700",
  },
  creditAmount: {
    color: "#16A34A",
  },
  debitAmount: {
    color: "#EF4444",
  },
  securityCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: "#ECFDF3",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },
  securitySubtitle: {
    fontSize: 12,
    color: "#15803D",
    marginTop: 2,
  },
  bottomSpacer: {
    height: 80,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
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
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  currency: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  methodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  methodOptionActive: {
    backgroundColor: "#EEF2FF",
    borderColor: Colors.primary,
  },
  methodOptionIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  methodOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  modalPrimaryButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  modalPrimaryDisabled: {
    opacity: 0.5,
  },
  modalPrimaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
