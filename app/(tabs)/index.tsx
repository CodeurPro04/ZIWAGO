import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
  Animated,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Valeur par défaut temporaire
const firstName = 'John';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour, {firstName} !</Text>
        </View>

        <View style={styles.content}>
          {/* Barre de recherche */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/booking/location')}
            activeOpacity={0.7}
          >
            {/*<MapPin size={24} color={Colors.primary} />*/}
            <Text style={styles.searchPlaceholder}>Où est garée la voiture ?</Text>
          </TouchableOpacity>

          {/* Section Services */}
          <View style={styles.serviceCardsRow}>
            {/* Carte Réserver maintenant */}
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => router.push('/booking/vehicle-selection')}
              activeOpacity={0.8}
            >
              <View style={styles.illustrationContainer}>
                <Image
                  source={require("@/assets/images/car-pana1.png")}
                  style={styles.illustration}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.serviceCardTitle}>Réserver{'\n'}maintenant</Text>
              <Text style={styles.serviceCardSubtitle}>
                Faites venir un laveur chez vous immédiatement
              </Text>
            </TouchableOpacity>

            {/* Carte Programmer */}
            <TouchableOpacity 
              style={styles.serviceCard}
              activeOpacity={0.8}
              onPress={() => router.push('/booking/schedule')}
            >
              <View style={styles.illustrationContainer}>
                <Image
                  source={require("@/assets/images/management-pana1.png")}
                  style={styles.illustration}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.serviceCardTitle}>Programmer un{'\n'}lavage</Text>
              <Text style={styles.serviceCardSubtitle}>
                Réservez un créneau qui vous convient
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  serviceCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    paddingTop: 24,
    paddingBottom: 24,
    minHeight: 280,
    justifyContent: 'space-between',
  },
  illustrationContainer: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  serviceCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 24,
  },
  serviceCardSubtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
});