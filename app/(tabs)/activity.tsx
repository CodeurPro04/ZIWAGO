import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import {
  Clock,
  CheckCircle,
  XCircle,
  Car,
  Calendar,
  MapPin,
  User,
  Star,
  MessageSquare,
  Search,
  ChevronRight,
  Package,
  TrendingUp,
  Award,
  Shield,
  Bell,
  Download,
  Filter,
  MoreVertical
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function ActivityScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Filtres simplifiés
  const filters = [
    { id: 'all', label: 'Tout' },
    { id: 'today', label: "Aujourd'hui" },
    { id: 'completed', label: 'Terminé' },
    { id: 'pending', label: 'À venir' },
  ];

  // Données fictives simplifiées
  const generateMockData = () => {
    const mockActivities = [
      {
        id: 1,
        status: 'completed',
        title: 'Lavage Premium',
        vehicle: 'Renault Clio',
        washer: 'Jean D.',
        date: 'Aujourd\'hui, 14:30',
        price: 4500,
        rating: 5,
        services: 3
      },
      {
        id: 2,
        status: 'pending',
        title: 'Lavage Programmé',
        vehicle: 'Peugeot 208',
        washer: 'Marie L.',
        date: 'Demain, 10:00',
        price: 5200,
        rating: null,
        services: 3
      },
      {
        id: 3,
        status: 'completed',
        title: 'Lavage Rapide',
        vehicle: 'Yamaha MT-07',
        washer: 'Pierre M.',
        date: 'Hier, 16:45',
        price: 2500,
        rating: 4,
        services: 2
      },
      {
        id: 4,
        status: 'cancelled',
        title: 'Lavage Annulé',
        vehicle: 'BMW Série 3',
        washer: 'Luc B.',
        date: '15 Mars, 11:30',
        price: 3800,
        rating: null,
        services: 2
      }
    ];

    const mockStats = {
      totalWashes: 24,
      totalSpent: 125400,
      averageRating: 4.7,
      streak: 3,
    };

    setActivities(mockActivities);
    setStats(mockStats);
  };

  useEffect(() => {
    generateMockData();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      generateMockData();
      setRefreshing(false);
    }, 1000);
  };

  const filteredActivities = activities.filter(activity => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'today') return activity.date.includes('Aujourd\'hui');
    return activity.status === selectedFilter;
  });

  const getStatusConfig = (status) => {
    const configs = {
      completed: { 
        color: '#10B981', 
        bgColor: '#10B98120', 
        text: 'Terminé', 
        icon: <CheckCircle size={14} color="#10B981" /> 
      },
      pending: { 
        color: '#F59E0B', 
        bgColor: '#F59E0B20', 
        text: 'À venir', 
        icon: <Clock size={14} color="#F59E0B" /> 
      },
      cancelled: { 
        color: '#EF4444', 
        bgColor: '#EF444420', 
        text: 'Annulé', 
        icon: <XCircle size={14} color="#EF4444" /> 
      },
      in_progress: { 
        color: '#3B82F6', 
        bgColor: '#3B82F620', 
        text: 'En cours', 
        icon: <Clock size={14} color="#3B82F6" /> 
      }
    };
    return configs[status] || configs.completed;
  };

  const formatPrice = (price) => {
    return price.toLocaleString() + ' F CFA';
  };

  const handleActivityPress = (activity) => {
    console.log('Activity details:', activity);
  };

  const handleRateWasher = (activity) => {
    console.log('Rate washer:', activity.washer);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header fixe */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Activité</Text>
            <Text style={styles.subtitle}>
              {stats.totalWashes || 0} lavages • {formatPrice(stats.totalSpent || 0)}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Barre de recherche */}
        <TouchableOpacity style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <Text style={styles.searchText}>Rechercher un lavage...</Text>
        </TouchableOpacity>
      </View>

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
        {/* Cartes de statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalWashes || 0}</Text>
            <Text style={styles.statLabel}>Lavages</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.statValue}>{stats.averageRating || 0}</Text>
            </View>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.streak || 0}⭑</Text>
            <Text style={styles.statLabel}>Suite</Text>
          </View>
        </View>

        {/* Filtres */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterBtn,
                selectedFilter === filter.id && styles.filterBtnActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Liste des activités */}
        <View style={styles.activitiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Derniers lavages</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {filteredActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Aucune activité</Text>
              <Text style={styles.emptyText}>
                {selectedFilter === 'all' 
                  ? 'Commencez votre premier lavage'
                  : `Aucune activité ${selectedFilter === 'today' ? "aujourd'hui" : selectedFilter}`
                }
              </Text>
            </View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {filteredActivities.map((activity) => {
                const statusConfig = getStatusConfig(activity.status);
                
                return (
                  <TouchableOpacity
                    key={activity.id}
                    style={styles.activityCard}
                    onPress={() => handleActivityPress(activity)}
                    activeOpacity={0.7}
                  >
                    {/* En-tête avec statut */}
                    <View style={styles.activityHeader}>
                      <View style={styles.activityType}>
                        {activity.vehicle.includes('Moto') ? (
                          <Text style={styles.vehicleIcon}>🏍️</Text>
                        ) : (
                          <Car size={18} color={Colors.primary} />
                        )}
                        <Text style={styles.vehicleText}>{activity.vehicle}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                        {statusConfig.icon}
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                          {statusConfig.text}
                        </Text>
                      </View>
                    </View>

                    {/* Informations principales */}
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      
                      <View style={styles.activityDetails}>
                        <View style={styles.detailRow}>
                          <User size={14} color={Colors.textSecondary} />
                          <Text style={styles.detailText}>{activity.washer}</Text>
                          {activity.rating && (
                            <>
                              <Star size={12} color="#F59E0B" />
                              <Text style={styles.ratingText}>{activity.rating}</Text>
                            </>
                          )}
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Clock size={14} color={Colors.textSecondary} />
                          <Text style={styles.detailText}>{activity.date}</Text>
                        </View>
                      </View>

                      {/* Footer avec prix et actions */}
                      <View style={styles.activityFooter}>
                        <Text style={styles.price}>{formatPrice(activity.price)}</Text>
                        
                        <View style={styles.actionButtons}>
                          {activity.status === 'completed' && !activity.rating && (
                            <TouchableOpacity 
                              style={styles.rateBtn}
                              onPress={() => handleRateWasher(activity)}
                            >
                              <Star size={14} color="#F59E0B" />
                              <Text style={styles.rateText}>Évaluer</Text>
                            </TouchableOpacity>
                          )}
                          
                          <TouchableOpacity style={styles.moreBtn}>
                            <MoreVertical size={16} color={Colors.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          )}
        </View>

        {/* Impact écologique 
        <View style={styles.impactSection}>
          <View style={styles.impactCard}>
            <View style={styles.impactHeader}>
              <Shield size={20} color="#10B981" />
              <Text style={styles.impactTitle}>Impact écologique</Text>
            </View>
            <View style={styles.impactStats}>
              <View style={styles.impactStat}>
                <Text style={styles.impactValue}>12.5 kg</Text>
                <Text style={styles.impactLabel}>CO₂ économisé</Text>
              </View>
              <View style={styles.impactStat}>
                <Text style={styles.impactValue}>450 L</Text>
                <Text style={styles.impactLabel}>Eau préservée</Text>
              </View>
            </View>
            <Text style={styles.impactText}>
              Votre contribution à l'environnement avec nos techniques écologiques
            </Text>
          </View>
        </View> */}

        {/* Export */}
        <TouchableOpacity style={styles.exportCard}>
          <Download size={20} color={Colors.primary} />
          <View style={styles.exportContent}>
            <Text style={styles.exportTitle}>Exporter l'historique</Text>
            <Text style={styles.exportText}>Télécharger en PDF</Text>
          </View>
          <ChevronRight size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

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
  // Header
  header: {
    backgroundColor: 'white',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + Spacing.md : Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  // Statistiques
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // Filtres
  filtersScroll: {
    marginBottom: Spacing.md,
  },
  filtersContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  // Activités
  activitiesSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  // Carte d'activité
  activityCard: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  activityType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vehicleIcon: {
    fontSize: 18,
  },
  vehicleText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  activityContent: {
    gap: Spacing.sm,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  activityDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: 13,
    color: Colors.text,
  },
  ratingText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '30',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  rateText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '500',
  },
  moreBtn: {
    padding: 4,
  },
  // Impact écologique
  impactSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  impactCard: {
    backgroundColor: '#10B98110',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#10B98130',
    gap: Spacing.sm,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  impactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  impactStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  impactStat: {
    alignItems: 'flex-start',
  },
  impactValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 2,
  },
  impactLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  impactText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  // Export
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  exportContent: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  exportText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Espace final
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 80 : 60,
  },
});