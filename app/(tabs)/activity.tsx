import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import {
  Clock,
  CheckCircle,
  XCircle,
  Car,
  Star,
  User,
  Calendar,
  ChevronRight,
  Filter,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useUserStore, ActivityItem } from '@/hooks/useUserData';

const FILTERS = [
  { id: 'all', label: 'Tout' },
  { id: 'today', label: "Aujourd'hui" },
  { id: 'completed', label: 'Termin\u00e9s' },
  { id: 'pending', label: '\u00c0 venir' },
  { id: 'cancelled', label: 'Annul\u00e9s' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  completed: {
    label: 'Termin\u00e9',
    color: '#16A34A',
    bg: '#DCFCE7',
    icon: CheckCircle,
  },
  pending: {
    label: '\u00c0 venir',
    color: '#F59E0B',
    bg: '#FEF3C7',
    icon: Clock,
  },
  cancelled: {
    label: 'Annul\u00e9',
    color: '#EF4444',
    bg: '#FEE2E2',
    icon: XCircle,
  },
};

export default function ActivityScreen() {
  const router = useRouter();
  const activities = useUserStore((state) => state.activities);
  const updateActivityStatus = useUserStore((state) => state.updateActivityStatus);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    const totalWashes = activities.filter((item) => item.status === 'completed').length;
    const totalSpent = activities.reduce((sum, item) => sum + item.price, 0);
    const ratings = activities.filter((item) => item.rating).map((item) => item.rating as number);
    const averageRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const planned = activities.filter((item) => item.status === 'pending').length;
    return { totalWashes, totalSpent, averageRating, planned };
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (selectedFilter === 'all') return activities;
    if (selectedFilter === 'today') {
      return activities.filter((item) => item.date.includes("Aujourd'hui"));
    }
    return activities.filter((item) => item.status === selectedFilter);
  }, [selectedFilter, activities]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleOpenDetails = (activity: ActivityItem) => {
    router.push({
      pathname: '/booking/activity-details',
      params: {
        id: activity.id,
        status: activity.status,
        title: activity.title,
        vehicle: activity.vehicle,
        washer: activity.washer,
        date: activity.date,
        price: activity.price.toString(),
        rating: activity.rating ? activity.rating.toString() : '',
      },
    });
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
            <Text style={styles.title}>Activité</Text>
            <Text style={styles.subtitle}>
              {stats.totalWashes} lavages - {stats.totalSpent.toLocaleString()} FCFA
            </Text>
          </View>
          <View style={styles.filterButton}>
            <Filter size={18} color={Colors.textSecondary} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalWashes}</Text>
            <Text style={styles.statLabel}>Lavages</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.ratingRow}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
            </View>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={16} color={Colors.primary} />
            <Text style={styles.statLabel}>{stats.planned} planifiés</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {FILTERS.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Derniers lavages</Text>
        </View>

        {filteredActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Aucune activité</Text>
            <Text style={styles.emptyText}>Vos prochaines réservations s&lsquo;afficheront ici.</Text>
          </View>
        ) : (
          filteredActivities.map((activity) => {
            const statusConfig = STATUS_CONFIG[activity.status];
            const StatusIcon = statusConfig.icon;
            return (
              <TouchableOpacity
                key={activity.id}
                style={styles.card}
                onPress={() => handleOpenDetails(activity)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.vehicleRow}>
                    <Car size={16} color={Colors.primary} />
                    <Text style={styles.vehicleText}>{activity.vehicle}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <StatusIcon size={12} color={statusConfig.color} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{activity.title}</Text>

                <View style={styles.cardDetailRow}>
                  <User size={14} color={Colors.textSecondary} />
                  <Text style={styles.cardDetailText}>{activity.washer}</Text>
                </View>
                <View style={styles.cardDetailRow}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.cardDetailText}>{activity.date}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.priceText}>{activity.price.toLocaleString()} FCFA</Text>
                  {activity.status === 'pending' ? (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.completeButton]}
                        onPress={() => updateActivityStatus(activity.id, 'completed')}
                      >
                        <CheckCircle size={12} color="#FFFFFF" />
                        <Text style={styles.actionText}>Terminé</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => updateActivityStatus(activity.id, 'cancelled')}
                      >
                        <XCircle size={12} color="#EF4444" />
                        <Text style={styles.cancelText}>Annuler</Text>
                      </TouchableOpacity>
                    </View>
                  ) : activity.status === 'completed' && !activity.rating ? (
                    <TouchableOpacity style={styles.rateButton} onPress={() => handleOpenDetails(activity)}>
                      <Star size={12} color="#F59E0B" />
                      <Text style={styles.rateText}>Évaluer</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.detailButton} onPress={() => handleOpenDetails(activity)}>
                      <Text style={styles.detailText}>Détails</Text>
                      <ChevronRight size={14} color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filtersRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.heading,
    marginBottom: 0,
  },
  emptyState: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cardDetailText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  completeButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  rateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  bottomSpacer: {
    height: 80,
  },
});
