import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useUserStore } from "@/hooks/useUserData";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";

export default function OnboardingStep2() {
  const router = useRouter();
  const { firstName, lastName, email, updateUserData } = useUserStore();
  const [accepted, setAccepted] = useState(false);

  const handleContinue = () => {
    if (firstName && lastName && accepted) {
      router.push("/onboarding/success");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Comment devons-nous vous appeler ?</Text>

        <Input
          placeholder="Entrez votre prénom"
          placeholderTextColor="#999"
          value={firstName}
          onChangeText={(text) => updateUserData("firstName", text)}
          style={styles.input}
        />

        <Input
          placeholder="Entrez votre nom de famille"
          placeholderTextColor="#999"
          value={lastName}
          onChangeText={(text) => updateUserData("lastName", text)}
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>
          Ajoutez votre adresse e-mail pour les reçus et lassistance (optionnel)
        </Text>

        <Input
          placeholder="Entrez votre adresse e-mail"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => updateUserData("email", text)}
          style={styles.input}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            Je confirme avoir au moins 18 ans et j&apos;accepte les{" "}
            <Text style={styles.linkNoUnderline} onPress={() => {}}>
              Conditions d&apos;utilisation
            </Text>{" "}
            et la{" "}
            <Text style={styles.linkNoUnderline} onPress={() => {}}>
              Politique de confidentialité
            </Text>{" "}
            de Ziwago.
          </Text>
        </TouchableOpacity>

        <Button
          title="Continuer"
          onPress={handleContinue}
          disabled={!firstName || !lastName || !accepted}
        />
      </ScrollView>
    </SafeAreaView>
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
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
    color: Colors.text,
  },
  input: {
    marginBottom: Spacing.md,
  },
  checkboxContainer: {
    flexDirection: "row",
    marginVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 4,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  linkNoUnderline: {
    color: Colors.primary,
    fontWeight: "500",
  },
  link: {
    color: Colors.primary,
    textDecorationLine: "underline",
  },
});
