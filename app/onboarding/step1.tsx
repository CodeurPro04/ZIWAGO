import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { Colors, Spacing, Typography } from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function OnboardingStep1() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>ZIWAGO</Text>

        <View style={styles.illustration}>
          <Image
            source={require("@/assets/images/wash-pana1.png")}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.pagination}>
            <View style={[styles.paginationDot, styles.paginationDotActive]} />
            <View style={styles.paginationDot} />
          </View>

          <Text style={styles.title}>
            Comment souhaitez-vous utiliser Ziwago ?
          </Text>

          <View style={styles.buttonsContainer}>
            <Button
              title="Je veux réserver un lavage de voiture"
              onPress={() => router.push("/onboarding/success")}
            />

            <Button
              title="Je veux travailler comme laveur"
              onPress={() => {}}
              variant="secondary"
            />
          </View>
        </View>
      </View>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  logo: {
    fontSize: 35,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  illustration: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.47,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  illustrationImage: {
    width: "100%",
    height: "100%",
    maxWidth: 500,
  },
  bottomSection: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: Spacing.lg,
  },
  buttonsContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  pagination: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  paginationDot: {
    width: 30,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  paginationDotActive: {
    backgroundColor: Colors.primary,
    width: 40,
  },
  title: {
    fontSize: SCREEN_WIDTH < 380 ? 20 : 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: Spacing.xl,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
  },
});
