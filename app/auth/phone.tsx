import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useUserStore } from "@/hooks/useUserData";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const COUNTRIES = [
  { code: "+225", flag: "🇨🇮", name: "Côte d'Ivoire", initials: "CI" },
  { code: "+33", flag: "🇫🇷", name: "France", initials: "FR" },
  { code: "+1", flag: "🇺🇸", name: "États-Unis", initials: "US" },
  { code: "+44", flag: "🇬🇧", name: "Royaume-Uni", initials: "GB" },
  { code: "+221", flag: "🇸🇳", name: "Sénégal", initials: "SN" },
  { code: "+237", flag: "🇨🇲", name: "Cameroun", initials: "CM" },
  { code: "+229", flag: "🇧🇯", name: "Bénin", initials: "BJ" },
  { code: "+226", flag: "🇧🇫", name: "Burkina Faso", initials: "BF" },
];

export default function PhoneScreen() {
  const router = useRouter();
  const { phone, updateUserData } = useUserStore();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleContinue = () => {
    if (phone.length >= 8) {
      router.push("/auth/verification");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            Entrez votre numéro de téléphone portable
          </Text>

          <View style={styles.phoneInputContainer}>
            <TouchableOpacity
              style={styles.countryCode}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.flag}>{selectedCountry.flag}</Text>
              <Text style={styles.codeText}>{selectedCountry.code}</Text>
              <Icon name="chevron-down" size={20} color={Colors.text} />
            </TouchableOpacity>

            <Input
              style={styles.phoneInput}
              placeholder="Ex: 07 12 34 56 78"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => updateUserData("phone", text)}
              maxLength={10}
            />
          </View>

          <Button title="Continuer" onPress={handleContinue} />

          <Text style={styles.divider}>ou</Text>

          <TouchableOpacity style={styles.socialButton}>
            <View style={styles.socialButtonContent}>
              <Icon name="apple" size={24} color="#000" />
              <Text style={styles.socialButtonText}>Continuer avec Apple</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <View style={styles.socialButtonContent}>
              <Icon name="google" size={24} color="#DB4437" />
              <Text style={styles.socialButtonText}>Continuer avec Google</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <View style={styles.socialButtonContent}>
              <Icon name="email" size={24} color="black" />
              <Text style={styles.socialButtonText}>Continuer avec Email</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            En continuant, vous acceptez de recevoir des appels, des messages
            WhatsApp ou SMS de la part de Ziwago concernant vos commandes et mises
            à jour. Vous pouvez vous désabonner à tout moment.
          </Text>
        </View>

        {/* Modal de sélection de pays */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Sélectionnez un pays</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Icon name="close" size={24} color={Colors.text} />
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    data={COUNTRIES}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.countryItem}
                        onPress={() => {
                          setSelectedCountry(item);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.countryFlag}>{item.flag}</Text>
                        <Text style={styles.countryName}>{item.name}</Text>
                        <Text style={styles.countryInitials}>({item.initials})</Text>
                        <Text style={styles.countryCodeText}>{item.code}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    ...Typography.title,
    marginBottom: Spacing.xl,
    marginTop: Spacing.xxl,
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  flag: {
    fontSize: 24,
  },
  codeText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  phoneInput: {
    flex: 1,
  },
  divider: {
    textAlign: "center",
    color: Colors.textSecondary,
    marginVertical: Spacing.md,
  },
  socialButton: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
  // Styles du modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.lg,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: Spacing.sm,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  countryInitials: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primary,
  },
});