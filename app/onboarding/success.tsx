import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Colors, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OnboardingSuccess() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>ZIWAGO</Text>

        <View style={styles.imageContainer}>
          <Image 
            source={require('@/assets/images/Sale-pana1.png')}
            style={styles.successImage}
            resizeMode="contain"
          />
        </View>

        {/* Pagination dots */}
        <View style={styles.pagination}>
          <View style={styles.paginationDot} />
          <View style={[styles.paginationDot,]} />
          <View style={[styles.paginationDot, styles.paginationDotActive]} />
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.title}>
            Réservez un lavage de voiture à tout moment, n&apos;importe où.
          </Text>

          <View style={styles.buttonsContainer}>
            <Button 
              title="Continuer" 
              onPress={() => router.replace('/(tabs)')} 
            />

            <Button
              title="Passer"
              onPress={() => router.replace('/(tabs)')}
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
    paddingTop: Spacing.xl,
  },
  logo: {
    fontSize: 35,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  successImage: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    gap: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  paginationDot: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  paginationDotActive: {
    backgroundColor: Colors.primary,
    width: 50,
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: SCREEN_WIDTH < 380 ? 22 : 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.text,
    lineHeight: 36,
    paddingHorizontal: Spacing.sm,
  },
  buttonsContainer: {
    width: '100%',
    gap: Spacing.md,
  },
});