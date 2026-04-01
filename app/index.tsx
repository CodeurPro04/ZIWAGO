import React, { useMemo, useState } from 'react';
import { Redirect, useRootNavigationState } from 'expo-router';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useUserStore } from '@/hooks/useUserData';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { authenticateWithBiometrics, canUseFaceId, getBiometricLabel } from '@/lib/biometrics';

export default function Index() {
  const rootNavigationState = useRootNavigationState();
  const backendCustomerId = useUserStore((state) => state.backendCustomerId);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const biometricEnabled = useUserStore((state) => state.biometricEnabled);
  const onboardingCompleted = useUserStore((state) => state.onboardingCompleted);
  const [unlocking, setUnlocking] = useState(false);
  const [biometricUnlocked, setBiometricUnlocked] = useState(false);

  const isLoggedIn = useMemo(
    () => Boolean(backendCustomerId) || isAuthenticated,
    [backendCustomerId, isAuthenticated]
  );

  if (!rootNavigationState?.key) {
    return null;
  }

  if (isLoggedIn && biometricEnabled && !biometricUnlocked) {
    const unlock = async () => {
      setUnlocking(true);
      try {
        const label = await getBiometricLabel();
        if (Platform.OS === 'ios') {
          const faceIdAvailable = await canUseFaceId();
          if (!faceIdAvailable) {
            Alert.alert('Face ID indisponible', 'Face ID n est pas configure sur cet iPhone.');
            return;
          }
        }
        const success = await authenticateWithBiometrics(`Se connecter avec ${label}`);
        if (!success) {
          Alert.alert('Authentification annulee', `Utilisez ${label} pour acceder a votre compte.`);
          return;
        }
        setBiometricUnlocked(true);
      } catch {
        Alert.alert('Erreur', 'Impossible de lancer la verification biométrique.');
      } finally {
        setUnlocking(false);
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Deverrouillage securise</Text>
          <Text style={styles.subtitle}>Pour proteger votre compte, confirmez votre identite avec Face ID ou empreinte.</Text>
          <TouchableOpacity style={[styles.button, unlocking && styles.buttonDisabled]} onPress={unlock} disabled={unlocking}>
            {unlocking ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.buttonText}>Deverrouiller</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  if (onboardingCompleted) {
    return <Redirect href="/auth/email" />;
  }

  return <Redirect href="/onboarding/success" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
