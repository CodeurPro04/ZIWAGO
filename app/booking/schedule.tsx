import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Car, Sparkles } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Button } from '@/components/Button';
import { useUserStore } from '@/hooks/useUserData';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import BerlineSvg from '@/assets/svg/berline.svg';
import CompacteSvg from '@/assets/svg/compacte.svg';
import SuvSvg from '@/assets/svg/suv.svg';
import GroupSvg from '@/assets/svg/Group.svg';
import Group5Svg from '@/assets/svg/Group5.svg';
import Group7Svg from '@/assets/svg/Group7.svg';

type TimeSlot = {
  id: string;
  label: string;
  hint: string;
};

const WASH_TYPES = {
  exterior: { title: 'Ext\u00e9rieur uniquement', price: 2000 },
  interior: { title: 'Int\u00e9rieur uniquement', price: 2500 },
  complete: { title: 'Lavage complet', price: 4000 },
};

const WASH_TYPE_OPTIONS = [
  { key: 'exterior', title: WASH_TYPES.exterior.title, price: WASH_TYPES.exterior.price, icon: GroupSvg },
  { key: 'interior', title: WASH_TYPES.interior.title, price: WASH_TYPES.interior.price, icon: Group5Svg },
  { key: 'complete', title: WASH_TYPES.complete.title, price: WASH_TYPES.complete.price, icon: Group7Svg },
];



const TIME_SLOTS: TimeSlot[] = [
  { id: 'morning', label: '08:00 - 10:00', hint: 'Meilleure disponibilit\u00e9' },
  { id: 'late-morning', label: '10:30 - 12:30', hint: 'Tr\u00e8s demand\u00e9' },
  { id: 'afternoon', label: '14:00 - 16:00', hint: 'Recommand\u00e9' },
  { id: 'evening', label: '17:00 - 19:00', hint: 'Fin de journ\u00e9e' },
];
const VEHICLES = [
  { key: 'Berline', label: 'Berline', icon: BerlineSvg },
  { key: 'Compacte', label: 'Compacte', icon: CompacteSvg },
  { key: 'SUV', label: 'SUV', icon: SuvSvg },
] as const;

export default function ScheduleScreen() {
  const router = useRouter();
  const {
    selectedLocation,
    selectedLocationCoords,
    selectedVehicle,
    selectedWashType,
    walletBalance,
    updateUserData,
  } = useUserStore();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const previewCoords = selectedLocationCoords || { latitude: 5.3364, longitude: -4.0267 };

  const days = useMemo(() => {
    const labels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const today = new Date();
    return Array.from({ length: 5 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        dayLabel: labels[date.getDay()],
        dateLabel: `${date.getDate()}/${date.getMonth() + 1}`,
        fullLabel: index === 0 ? "Aujourd'hui" : labels[date.getDay()],
      };
    });
  }, []);

  const washConfig = WASH_TYPES[selectedWashType] || WASH_TYPES.exterior;
  const selectedSlot = TIME_SLOTS.find((slot) => slot.id === selectedSlotId);
  const selectedSlotPrice = selectedSlot?.id === 'evening'
    ? washConfig.price + 1000
    : washConfig.price;

  const handleSchedule = () => {
    if (!selectedWashType) {
      Alert.alert('Choix requis', 'Veuillez choisir un type de lavage avant de programmer.');
      router.push('/booking/wash-type');
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Horaire requis', 'Veuillez s\u00e9lectionner un cr\u00e9neau disponible.');
      return;
    }
    if (selectedSlotPrice > walletBalance) {
      Alert.alert('Solde insuffisant', 'Veuillez recharger votre portefeuille avant de programmer.');
      return;
    }


    const day = days[selectedDayIndex];
    const scheduledAt = `${day.fullLabel} - ${selectedSlot.label}`;

    router.push({
      pathname: '/booking/schedule-success',
      params: {
        address: encodeURIComponent(selectedLocation),
        vehicle: encodeURIComponent(selectedVehicle),
        washType: encodeURIComponent(washConfig.title),
        price: selectedSlotPrice.toString(),
        scheduledAt: encodeURIComponent(scheduledAt),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}></Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programmer un lavage</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.mapCard}
          activeOpacity={0.9}
          onPress={() => router.push('/booking/location')}
        >
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.miniMap}
            region={{
              ...previewCoords,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            pointerEvents="none"
          >
            <Marker coordinate={previewCoords} />
          </MapView>
          <View style={styles.mapOverlay}>
            <Text style={styles.mapTitle} numberOfLines={2}>
              {selectedLocation || 'S\u00e9lectionnez une adresse'}
            </Text>
            <Text style={styles.mapSubtitle}>Touchez pour modifier l&lsquo;emplacement</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <MapPin size={18} color={Colors.primary} />
            <Text style={styles.summaryText}>{selectedLocation}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Car size={18} color={Colors.primary} />
            <Text style={styles.summaryText}>{selectedVehicle}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Sparkles size={18} color={Colors.primary} />
            <Text style={styles.summaryText}>{washConfig.title}</Text>
          </View>
        </View>
        <View style={styles.sectionHeader}>
          <Car size={18} color={Colors.text} />
          <Text style={styles.sectionTitle}>Type de véhicule</Text>
        </View>
        <View style={styles.vehicleRow}>
          {VEHICLES.map((vehicle) => {
            const isActive = vehicle.key === selectedVehicle;
            return (
              <TouchableOpacity
                key={vehicle.key}
                style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
                onPress={() => updateUserData('selectedVehicle', vehicle.key)}
                activeOpacity={0.8}
              >
                <View style={styles.vehicleIcon}>
                  <vehicle.icon width={58} height={38} />
                </View>
                <Text style={[styles.vehicleLabel, isActive && styles.vehicleLabelActive]}>
                  {vehicle.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.sectionHeader}>
          <Sparkles size={18} color={Colors.text} />
          <Text style={styles.sectionTitle}>Type de lavage</Text>
        </View>
        <View style={styles.washTypeGrid}>
          {WASH_TYPE_OPTIONS.map((wash) => {
            const isActive = wash.key === selectedWashType;
            return (
              <TouchableOpacity
                key={wash.key}
                style={[styles.washTypeCard, isActive && styles.washTypeCardActive]}
                onPress={() => updateUserData('selectedWashType', wash.key)}
                activeOpacity={0.8}
              >
                <View style={styles.washTypeIcon}>
                  <wash.icon width={54} height={54} />
                </View>
                <View style={styles.washTypeBody}>
                  <Text style={[styles.washTypeTitle, isActive && styles.washTypeTitleActive]}>
                    {wash.title}
                  </Text>
                  <Text style={[styles.washTypePrice, isActive && styles.washTypePriceActive]}>
                    {wash.price.toLocaleString()} F CFA
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.sectionHeader}>
          <Calendar size={18} color={Colors.text} />
          <Text style={styles.sectionTitle}>Choisissez un jour</Text>
        </View>
        <View style={styles.daysRow}>
          {days.map((day, index) => {
            const isActive = index === selectedDayIndex;
            return (
              <TouchableOpacity
                key={day.key}
                style={[styles.dayCard, isActive && styles.dayCardActive]}
                onPress={() => setSelectedDayIndex(index)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>
                  {day.dayLabel}
                </Text>
                <Text style={[styles.dateLabel, isActive && styles.dateLabelActive]}>
                  {day.dateLabel}
                </Text>
                {index === 0 && (
                  <Text style={[styles.todayTag, isActive && styles.todayTagActive]}>
                    Aujourd&lsquo;hui
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.sectionHeader}>
          <Clock size={18} color={Colors.text} />
          <Text style={styles.sectionTitle}>Créneaux disponibles</Text>
        </View>

        {TIME_SLOTS.map((slot) => {
          const isActive = slot.id === selectedSlotId;
          const slotPrice = slot.id === 'evening' ? washConfig.price + 1000 : washConfig.price;
          return (
            <TouchableOpacity
              key={slot.id}
              style={[styles.slotCard, isActive && styles.slotCardActive]}
              onPress={() => setSelectedSlotId(slot.id)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={[styles.slotLabel, isActive && styles.slotLabelActive]}>
                  {slot.label}
                </Text>
                <Text style={[styles.slotHint, isActive && styles.slotHintActive]}>
                  {slot.hint}
                </Text>
              </View>
              <View style={[styles.slotBadge, isActive && styles.slotBadgeActive]}>
                <Text style={[styles.slotBadgeText, isActive && styles.slotBadgeTextActive]}>
                  {slotPrice.toLocaleString()} F CFA
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.footer}>
          <Button title="Programmer le lavage" onPress={handleSchedule} />
        </View>
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
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  mapCard: {
    height: 160,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  mapSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.heading,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  vehicleCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  vehicleIcon: {
    marginBottom: Spacing.sm,
  },
  vehicleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  vehicleLabelActive: {
    color: '#FFFFFF',
  },
  washTypeGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  washTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  washTypeCardActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.primary,
  },
  washTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  washTypeIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  washTypeBody: {
    flex: 1,
  },
  washTypeTitleActive: {
    color: Colors.primary,
  },
  washTypePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  washTypePriceActive: {
    color: Colors.primary,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  dayLabelActive: {
    color: '#FFFFFF',
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  dateLabelActive: {
    color: '#FFFFFF',
  },
  todayTag: {
    marginTop: 6,
    fontSize: 10,
    color: Colors.primary,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  todayTagActive: {
    color: Colors.primary,
    backgroundColor: '#FFFFFF',
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slotCardActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.primary,
  },
  slotLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  slotLabelActive: {
    color: Colors.primary,
  },
  slotHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  slotHintActive: {
    color: Colors.primary,
  },
  slotBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.sm,
  },
  slotBadgeActive: {
    backgroundColor: Colors.primary,
  },
  slotBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  slotBadgeTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});



