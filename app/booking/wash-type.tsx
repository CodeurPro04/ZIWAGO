import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Car, Wallet, ChevronRight } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useUserStore } from '@/hooks/useUserData';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export default function WashTypeScreen() {
  const router = useRouter();
  const {
    selectedLocation,
    selectedVehicle,
    selectedWashType,
    walletBalance,
    updateUserData,
  } = useUserStore();

  const washTypes = [
    {
      type: 'exterior',
      title: 'Extérieur uniquement',
      price: 2000,
      description: 'Carrosserie, vitres et pneus',
      icon: '🚗',
    },
    {
      type: 'interior',
      title: 'Intérieur uniquement',
      price: 2500,
      description: 'Sièges, tapis et tableau de bord',
      icon: '🧹',
    },
    {
      type: 'complete',
      title: 'Lavage complet',
      price: 4000,
      description: 'Extérieur et intérieur complets',
      icon: '✨',
    },
  ];

  const handleRequest = () => {
    const selectedWash = washTypes.find((wash) => wash.type === selectedWashType);
    if (!selectedWash) {
      Alert.alert('SÇ¸lection requise', 'Veuillez choisir un type de lavage');
      return;
    }

    router.push({
      pathname: '/booking/searching',
      params: {
        address: encodeURIComponent(selectedLocation),
        vehicle: encodeURIComponent(selectedVehicle),
        washType: encodeURIComponent(selectedWash.title),
        price: selectedWash.price.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Type de lavage</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={40} color={Colors.primary} />
          <Text style={styles.locationText}>{selectedLocation}</Text>
        </View>

        <View style={styles.infoCard}>
          <MapPin size={20} color={Colors.primary} />
          <Text style={styles.infoText}>{selectedLocation}</Text>
        </View>

        <View style={styles.infoCard}>
          <Car size={20} color={Colors.primary} />
          <Text style={styles.infoText}>{selectedVehicle}</Text>
        </View>

        <Text style={styles.sectionTitle}>Choisissez le type de lavage</Text>

        {washTypes.map((wash) => (
          <TouchableOpacity
            key={wash.type}
            style={[
              styles.washCard,
              selectedWashType === wash.type && styles.washCardActive,
            ]}
            onPress={() => updateUserData('selectedWashType', wash.type)}
            activeOpacity={0.7}
          >
            <Text style={styles.washIcon}>{wash.icon}</Text>
            <View style={styles.washDetails}>
              <Text style={styles.washTitle}>{wash.title}</Text>
              <Text style={styles.washPrice}>{wash.price.toLocaleString()} F CFA</Text>
              <Text style={styles.washDescription}>{wash.description}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.walletInfo} activeOpacity={0.7}>
          <Wallet size={24} color={Colors.primary} />
          <Text style={styles.walletText}>
            Solde du portefeuille : {walletBalance.toLocaleString()} F CFA
          </Text>
          <ChevronRight size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        <Button title="Demander" onPress={handleRequest} />
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
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  locationText: {
    marginTop: Spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    color: Colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  sectionTitle: {
    ...Typography.heading,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  washCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  washCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  washIcon: {
    fontSize: 50,
  },
  washDetails: {
    flex: 1,
  },
  washTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  washPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  washDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  walletText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});
