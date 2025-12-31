import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  RefreshControl,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Image,
  StatusBar
} from 'react-native';
import { 
  Wallet, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  CreditCard,
  Gift,
  Shield,
  ChevronRight,
  QrCode,
  Banknote,
  Smartphone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Send,
  Download,
  X,
  Wifi,
  Radio,
  Smartphone as Mobile,
  DollarSign,
  SmartphoneCharging,
  Wifi as MoovIcon,
  RadioTower as MTNIcon,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  MoreVertical,
  Smartphone as SmartphoneIcon,
  CreditCard as CreditCardIcon,
  Globe,
  Zap,
  ChevronDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Bell,
  Calendar
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Données temporaires pour les icônes
const Car = (props) => <Text style={{ fontSize: props.size || 20 }}>🚗</Text>;

export default function WalletScreen() {
  const [balance, setBalance] = useState(28500);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Méthodes de recharge améliorées
  const paymentMethods = [
    {
      id: 1,
      name: 'Orange Money',
      icon: 'SmartphoneCharging',
      color: '#FF6B35',
      gradient: ['#FF6B35', '#FF8B35'],
      type: 'mobile',
      number: '•••• 7845',
      commission: '0.5%',
      popular: true
    },
    {
      id: 2,
      name: 'MTN Money',
      icon: 'MTNIcon',
      color: '#FFCC00',
      gradient: ['#FFCC00', '#FFD700'],
      type: 'mobile',
      number: '•••• 9231',
      commission: '0.5%',
      popular: true
    },
    {
      id: 3,
      name: 'Moov Money',
      icon: 'MoovIcon',
      color: '#00A859',
      gradient: ['#00A859', '#00C851'],
      type: 'mobile',
      number: '•••• 4567',
      commission: '0.5%'
    },
    {
      id: 4,
      name: 'Wave',
      icon: 'Wifi',
      color: '#2D5BFF',
      gradient: ['#2D5BFF', '#4A6FFF'],
      type: 'mobile',
      number: '•••• 8910',
      commission: '1%',
      popular: true
    },
    {
      id: 5,
      name: 'Carte Bancaire',
      icon: 'CreditCard',
      color: '#3498DB',
      gradient: ['#3498DB', '#5DADE2'],
      type: 'card',
      number: '•••• 4321',
      commission: '1.5%',
      secure: true
    },
    {
      id: 6,
      name: 'Visa/Mastercard',
      icon: 'Globe',
      color: '#8E44AD',
      gradient: ['#8E44AD', '#9B59B6'],
      type: 'card',
      number: '•••• 5678',
      commission: '2%',
      secure: true
    }
  ];

  // Montants suggérés
  const suggestedAmounts = [
    { amount: 1000, label: '1K' },
    { amount: 2000, label: '2K' },
    { amount: 5000, label: '5K' },
    { amount: 10000, label: '10K' },
    { amount: 20000, label: '20K' },
    { amount: 50000, label: '50K' },
  ];

  useEffect(() => {
    loadBalanceVisibility();
    generateMockTransactions();
    
    // Animations d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const loadBalanceVisibility = async () => {
    try {
      const hidden = await AsyncStorage.getItem('balanceHidden');
      if (hidden !== null) {
        setBalanceHidden(JSON.parse(hidden));
      }
    } catch (error) {
      console.error('Error loading balance visibility:', error);
    }
  };

  const toggleBalanceVisibility = async () => {
    const newVisibility = !balanceHidden;
    setBalanceHidden(newVisibility);
    try {
      await AsyncStorage.setItem('balanceHidden', JSON.stringify(newVisibility));
    } catch (error) {
      console.error('Error saving balance visibility:', error);
    }
  };

  const generateMockTransactions = () => {
    const mockTransactions = [
      {
        id: 1,
        type: 'credit',
        amount: 5000,
        description: 'Recharge Orange Money',
        date: 'Aujourd\'hui, 14:30',
        status: 'completed',
        icon: 'SmartphoneCharging',
        color: '#FF6B35',
        category: 'recharge'
      },
      {
        id: 2,
        type: 'debit',
        amount: 2500,
        description: 'Lavage voiture - Renault Clio',
        date: 'Hier, 10:15',
        status: 'completed',
        icon: 'Car',
        color: Colors.primary,
        category: 'service'
      },
      {
        id: 3,
        type: 'credit',
        amount: 10000,
        description: 'Recharge MTN Money',
        date: '15 Mars, 09:45',
        status: 'completed',
        icon: 'MTNIcon',
        color: '#FFCC00',
        category: 'recharge'
      },
      {
        id: 4,
        type: 'debit',
        amount: 3500,
        description: 'Nettoyage intérieur',
        date: '12 Mars, 16:20',
        status: 'completed',
        icon: 'clean',
        color: Colors.primary,
        category: 'service'
      },
      {
        id: 5,
        type: 'debit',
        amount: 4500,
        description: 'Lavage premium',
        date: '10 Mars, 11:30',
        status: 'failed',
        icon: 'Car',
        color: '#E74C3C',
        category: 'service'
      },
      {
        id: 6,
        type: 'credit',
        amount: 20000,
        description: 'Recharge carte bancaire',
        date: '8 Mars, 14:00',
        status: 'completed',
        icon: 'CreditCard',
        color: '#3498DB',
        category: 'recharge'
      },
      {
        id: 7,
        type: 'credit',
        amount: 15000,
        description: 'Parrainage - Référence',
        date: '5 Mars, 09:00',
        status: 'completed',
        icon: 'Gift',
        color: '#8E44AD',
        category: 'bonus'
      }
    ];
    setTransactions(mockTransactions);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      generateMockTransactions();
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleMethodSelection = (method) => {
    setSelectedMethod(method);
    setTimeout(() => {
      setShowRechargeModal(true);
    }, 300);
  };

  const handleRecharge = () => {
    if (!rechargeAmount || isNaN(rechargeAmount) || parseInt(rechargeAmount) <= 0) {
      Alert.alert('Montant invalide', 'Veuillez entrer un montant valide');
      return;
    }

    const amount = parseInt(rechargeAmount);
    const commission = selectedMethod ? 
      (amount * parseFloat(selectedMethod.commission.replace('%', '')) / 100) : 0;
    const total = amount - commission;
    
    setIsLoading(true);
    setTimeout(() => {
      const newBalance = balance + total;
      setBalance(newBalance);
      
      const newTransaction = {
        id: transactions.length + 1,
        type: 'credit',
        amount: total,
        description: `Recharge ${selectedMethod?.name}`,
        date: 'Maintenant',
        status: 'completed',
        icon: selectedMethod?.icon || 'CreditCard',
        color: selectedMethod?.color || '#3498DB',
        category: 'recharge'
      };
      
      setTransactions([newTransaction, ...transactions]);
      setRechargeAmount('');
      setSelectedMethod(null);
      setShowRechargeModal(false);
      setIsLoading(false);
      
      Alert.alert(
        '✅ Recharge réussie', 
        `Montant: ${amount.toLocaleString()} F CFA\nCommission: ${commission.toLocaleString()} F CFA\nSolde crédité: ${total.toLocaleString()} F CFA`,
        [{ text: 'OK', style: 'default' }]
      );
    }, 2000);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(withdrawAmount) || parseInt(withdrawAmount) <= 0) {
      Alert.alert('Montant invalide', 'Veuillez entrer un montant valide');
      return;
    }

    const amount = parseInt(withdrawAmount);
    
    if (amount > balance) {
      Alert.alert('Solde insuffisant', 'Votre solde actuel ne permet pas ce retrait');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newBalance = balance - amount;
      setBalance(newBalance);
      
      const newTransaction = {
        id: transactions.length + 1,
        type: 'debit',
        amount: amount,
        description: 'Retrait vers compte bancaire',
        date: 'Maintenant',
        status: 'pending',
        icon: 'bank',
        color: '#E74C3C',
        category: 'withdrawal'
      };
      
      setTransactions([newTransaction, ...transactions]);
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      setIsLoading(false);
      
      Alert.alert(
        '⏳ Demande envoyée', 
        'Votre retrait sera traité dans les 24 heures',
        [{ text: 'OK', style: 'default' }]
      );
    }, 1500);
  };

  const getIconComponent = (iconName, color = "white", size = 20) => {
    switch(iconName) {
      case 'SmartphoneCharging': return <SmartphoneCharging size={size} color={color} />;
      case 'CreditCard': return <CreditCard size={size} color={color} />;
      case 'Gift': return <Gift size={size} color={color} />;
      case 'Car': return <Car size={size} />;
      case 'clean': return <Sparkles size={size} color={color} />;
      case 'Wifi': return <Wifi size={size} color={color} />;
      case 'MoovIcon': return <MoovIcon size={size} color={color} />;
      case 'MTNIcon': return <MTNIcon size={size} color={color} />;
      case 'bank': return <Banknote size={size} color={color} />;
      case 'plus': return <Plus size={size} color={color} />;
      case 'Globe': return <Globe size={size} color={color} />;
      default: return <Wallet size={size} color={color} />;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={14} color="#2ECC71" />;
      case 'pending': return <Clock size={14} color="#F39C12" />;
      case 'failed': return <XCircle size={14} color="#E74C3C" />;
      default: return <AlertCircle size={14} color="#95A5A6" />;
    }
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString() + ' F CFA';
  };

  const renderBalance = () => {
    if (balanceHidden) {
      return (
        <View style={styles.hiddenBalanceContainer}>
          <View style={styles.hiddenBalanceDots}>
            {[...Array(8)].map((_, i) => (
              <View key={i} style={styles.balanceDot} />
            ))}
          </View>
          <Text style={styles.hiddenBalanceText}>F CFA</Text>
        </View>
      );
    }
    return (
      <Text style={styles.balanceAmount}>{formatAmount(balance)}</Text>
    );
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    if (activeTab === 'recharge') return transaction.type === 'credit';
    if (activeTab === 'depense') return transaction.type === 'debit';
    return true;
  });

  const renderPaymentMethods = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.paymentMethodsScroll}
      contentContainerStyle={styles.paymentMethodsContent}
    >
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={styles.paymentMethodCard}
          onPress={() => handleMethodSelection(method)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={method.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.methodIconContainer}
          >
            {getIconComponent(method.icon, 'white', 22)}
          </LinearGradient>
          <Text style={styles.methodName} numberOfLines={1}>{method.name}</Text>
          {method.popular && (
            <View style={styles.popularBadge}>
              <TrendingUp size={10} color="#FFF" />
              <Text style={styles.popularText}>Populaire</Text>
            </View>
          )}
          {method.secure && (
            <View style={styles.secureBadge}>
              <ShieldCheck size={10} color="#FFF" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <Animated.View style={[styles.animatedContainer, { 
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
      }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.walletIconContainer}>
                <Wallet size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Portefeuille</Text>
                <Text style={styles.headerSubtitle}>Gérez votre argent</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => Alert.alert('Notifications', 'Fonctionnalité à venir')}
              >
                <Bell size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => Alert.alert('Historique', 'Fonctionnalité à venir')}
              >
                <History size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
              progressBackgroundColor="#FFF"
            />
          }
        >
          {/* Carte Solde */}
          <LinearGradient
            colors={['#4A6FFF', '#2D5BFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceCardContent}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Solde disponible</Text>
                <View style={styles.balanceActions}>
                  <TouchableOpacity 
                    onPress={toggleBalanceVisibility}
                    style={styles.visibilityButton}
                  >
                    {balanceHidden ? (
                      <EyeOff size={20} color="rgba(255,255,255,0.8)" />
                    ) : (
                      <Eye size={20} color="rgba(255,255,255,0.8)" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => Alert.alert('ID Copié', 'Votre ID a été copié dans le presse-papier')}
                    style={styles.copyButton}
                  >
                    <Copy size={18} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.balanceAmountContainer}>
                {renderBalance()}
                <View style={styles.balanceTrend}>
                  <ArrowUpRight size={16} color="#2ECC71" />
                  <Text style={styles.balanceTrendText}>+12% ce mois</Text>
                </View>
              </View>
              
              <View style={styles.balanceStats}>
                <View style={styles.statItem}>
                  <ArrowDownCircle size={18} color="#FFF" />
                  <Text style={styles.statValue}>{balanceHidden ? '••••' : '65,400 F'}</Text>
                  <Text style={styles.statLabel}>Recharges</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <ArrowUpCircle size={18} color="#FFF" />
                  <Text style={styles.statValue}>{balanceHidden ? '••••' : '28,500 F'}</Text>
                  <Text style={styles.statLabel}>Dépenses</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Actions rapides */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => setShowRechargeModal(true)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#2ECC71', '#27AE60']}
                  style={styles.quickActionGradient}
                >
                  <Plus size={24} color="white" />
                </LinearGradient>
                <Text style={styles.quickActionText}>Recharger</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => setShowWithdrawModal(true)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#3498DB', '#2980B9']}
                  style={styles.quickActionGradient}
                >
                  <Send size={24} color="white" />
                </LinearGradient>
                <Text style={styles.quickActionText}>Retirer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => Alert.alert('QR Code', 'Scanner pour recevoir un paiement')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#8E44AD', '#732D91']}
                  style={styles.quickActionGradient}
                >
                  <QrCode size={24} color="white" />
                </LinearGradient>
                <Text style={styles.quickActionText}>Recevoir</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => Alert.alert('Transfert', 'Transférer de l\'argent à un contact')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FF6B35', '#E55A28']}
                  style={styles.quickActionGradient}
                >
                  <ArrowRight size={24} color="white" />
                </LinearGradient>
                <Text style={styles.quickActionText}>Transférer</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Méthodes de recharge */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recharger avec</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {renderPaymentMethods()}
          </View>

          {/* Statistiques du mois */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ce mois-ci</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#4A6FFF20' }]}>
                  <TrendingUp size={20} color="#4A6FFF" />
                </View>
                <Text style={styles.statCardValue}>{transactions.length}</Text>
                <Text style={styles.statCardLabel}>Transactions</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#2ECC7120' }]}>
                  <ArrowDownCircle size={20} color="#2ECC71" />
                </View>
                <Text style={styles.statCardValue}>
                  {balanceHidden ? '••••' : '65,400 F'}
                </Text>
                <Text style={styles.statCardLabel}>Recharges</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#E74C3C20' }]}>
                  <ArrowUpCircle size={20} color="#E74C3C" />
                </View>
                <Text style={styles.statCardValue}>
                  {balanceHidden ? '••••' : '28,500 F'}
                </Text>
                <Text style={styles.statCardLabel}>Dépenses</Text>
              </View>
            </View>
          </View>

          {/* Transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transactions récentes</Text>
              <TouchableOpacity style={styles.filterButton}>
                <Calendar size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            
            {/* Tabs de filtrage */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tabsContainer}
              contentContainerStyle={styles.tabsContent}
            >
              {['all', 'recharge', 'depense'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab === 'all' ? 'Toutes' : tab === 'recharge' ? 'Recharges' : 'Dépenses'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {filteredTransactions.map((transaction) => (
              <TouchableOpacity 
                key={transaction.id}
                style={styles.transactionCard}
                activeOpacity={0.7}
                onPress={() => Alert.alert('Détails de la transaction', transaction.description)}
              >
                <View style={[styles.transactionIconContainer, { backgroundColor: transaction.color + '20' }]}>
                  {getIconComponent(transaction.icon, transaction.color, 20)}
                </View>
                
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription} numberOfLines={1}>
                    {transaction.description}
                  </Text>
                  <View style={styles.transactionMeta}>
                    {getStatusIcon(transaction.status)}
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                </View>
                
                <View style={styles.transactionAmountContainer}>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount
                  ]}>
                    {transaction.type === 'credit' ? '+' : '-'} 
                    {balanceHidden ? ' ••••' : ` ${transaction.amount.toLocaleString()} F`}
                  </Text>
                  <ChevronRight size={18} color={Colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Section sécurité */}
          <View style={styles.securitySection}>
            <View style={styles.securityCard}>
              <View style={styles.securityIconContainer}>
                <ShieldCheck size={24} color={Colors.primary} />
              </View>
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Protection maximale</Text>
                <Text style={styles.securityText}>
                  Toutes vos transactions sont cryptées et sécurisées
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: Spacing.xl * 2 }} />
        </ScrollView>

        {/* Modal Recharge */}
        <Modal
          visible={showRechargeModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowRechargeModal(false);
            setSelectedMethod(null);
          }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <Animated.View 
                style={styles.modalContent}
                entering={Platform.OS === 'ios' ? undefined : undefined}
              >
                <LinearGradient
                  colors={['#FFF', '#F8F9FF']}
                  style={styles.modalGradient}
                >
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleContainer}>
                      {selectedMethod && (
                        <LinearGradient
                          colors={selectedMethod.gradient}
                          style={styles.selectedMethodIcon}
                        >
                          {getIconComponent(selectedMethod.icon, 'white', 22)}
                        </LinearGradient>
                      )}
                      <View>
                        <Text style={styles.modalTitle}>
                          {selectedMethod ? `Recharger avec ${selectedMethod.name}` : 'Choisir un montant'}
                        </Text>
                        <Text style={styles.modalSubtitle}>
                          {selectedMethod ? `Commission: ${selectedMethod.commission}` : 'Sélectionnez votre méthode'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => {
                        setShowRechargeModal(false);
                        setSelectedMethod(null);
                      }}
                      style={styles.closeButton}
                    >
                      <X size={24} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  
                  {selectedMethod ? (
                    <>
                      <Text style={styles.amountLabel}>Montant (F CFA)</Text>
                      
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.currencySymbol}>F</Text>
                        <TextInput
                          style={styles.amountInput}
                          value={rechargeAmount}
                          onChangeText={setRechargeAmount}
                          placeholder="0"
                          keyboardType="numeric"
                          placeholderTextColor={Colors.textSecondary + '80'}
                          autoFocus={true}
                          selectionColor={Colors.primary}
                        />
                        <Text style={styles.currencyText}>CFA</Text>
                      </View>
                      
                      <Text style={styles.quickAmountsLabel}>Montants rapides</Text>
                      <View style={styles.quickAmountsGrid}>
                        {suggestedAmounts.map((item) => (
                          <TouchableOpacity
                            key={item.amount}
                            style={[
                              styles.quickAmountButton,
                              rechargeAmount === item.amount.toString() && styles.quickAmountButtonActive
                            ]}
                            onPress={() => setRechargeAmount(item.amount.toString())}
                          >
                            <Text style={[
                              styles.quickAmountText,
                              rechargeAmount === item.amount.toString() && styles.quickAmountTextActive
                            ]}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      
                      <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Montant</Text>
                          <Text style={styles.summaryValue}>
                            {rechargeAmount ? `${parseInt(rechargeAmount).toLocaleString()} F CFA` : '0 F CFA'}
                          </Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Commission</Text>
                          <Text style={styles.summaryValue}>
                            {rechargeAmount ? `${(parseInt(rechargeAmount) * 0.005).toFixed(0)} F CFA` : '0 F CFA'}
                          </Text>
                        </View>
                        <View style={[styles.summaryRow, styles.summaryTotal]}>
                          <Text style={styles.summaryTotalLabel}>Total crédité</Text>
                          <Text style={styles.summaryTotalValue}>
                            {rechargeAmount ? `${(parseInt(rechargeAmount) * 0.995).toFixed(0)} F CFA` : '0 F CFA'}
                          </Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity 
                        style={[styles.modalButton, (isLoading || !rechargeAmount) && styles.modalButtonDisabled]}
                        onPress={handleRecharge}
                        disabled={isLoading || !rechargeAmount}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <>
                            <Text style={styles.modalButtonText}>
                              Recharger {rechargeAmount ? `${parseInt(rechargeAmount).toLocaleString()} F CFA` : ''}
                            </Text>
                            <ArrowRight size={20} color="white" />
                          </>
                        )}
                      </TouchableOpacity>
                      
                      {selectedMethod && (
                        <TouchableOpacity 
                          style={styles.changeMethodButton}
                          onPress={() => setSelectedMethod(null)}
                        >
                          <Text style={styles.changeMethodText}>Changer de méthode</Text>
                          <ChevronDown size={16} color={Colors.primary} />
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <ScrollView style={styles.methodsScroll}>
                      <Text style={styles.modalSubtitle}>Choisissez votre méthode de paiement</Text>
                      {paymentMethods.map((method) => (
                        <TouchableOpacity
                          key={method.id}
                          style={styles.methodOption}
                          onPress={() => handleMethodSelection(method)}
                        >
                          <LinearGradient
                            colors={method.gradient}
                            style={styles.methodOptionIcon}
                          >
                            {getIconComponent(method.icon, 'white', 20)}
                          </LinearGradient>
                          <View style={styles.methodOptionInfo}>
                            <Text style={styles.methodOptionName}>{method.name}</Text>
                            <Text style={styles.methodOptionDetails}>
                              {method.number} • Commission {method.commission}
                            </Text>
                          </View>
                          {method.popular && (
                            <View style={styles.optionPopularBadge}>
                              <Text style={styles.optionPopularText}>Populaire</Text>
                            </View>
                          )}
                          <ChevronRight size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </LinearGradient>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  walletIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: Typography.primaryBold,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Typography.primary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: Typography.primaryBold,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    fontFamily: Typography.primarySemiBold,
  },
  balanceCard: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceCardContent: {
    padding: Spacing.xl,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Typography.primary,
  },
  balanceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  visibilityButton: {
    padding: Spacing.xs,
  },
  copyButton: {
    padding: Spacing.xs,
  },
  balanceAmountContainer: {
    marginBottom: Spacing.lg,
  },
  balanceAmount: {
    fontSize: width < 375 ? 36 : 44,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: Typography.primaryBold,
    marginBottom: Spacing.xs,
  },
  hiddenBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  hiddenBalanceDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  balanceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
    marginHorizontal: 3,
  },
  hiddenBalanceText: {
    fontSize: width < 375 ? 32 : 40,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Typography.primaryBold,
  },
  balanceTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  balanceTrendText: {
    fontSize: 14,
    color: '#2ECC71',
    fontWeight: '500',
    fontFamily: Typography.primaryMedium,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: Spacing.xs,
    fontFamily: Typography.primaryBold,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontFamily: Typography.primary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  quickActionsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
    fontFamily: Typography.primaryMedium,
  },
  paymentMethodsScroll: {
    marginHorizontal: -Spacing.lg,
    paddingLeft: Spacing.lg,
  },
  paymentMethodsContent: {
    paddingRight: Spacing.lg,
  },
  paymentMethodCard: {
    width: 100,
    marginRight: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  methodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
    fontFamily: Typography.primaryMedium,
  },
  popularBadge: {
    position: 'absolute',
    top: -4,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  popularText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: Typography.primaryBold,
  },
  secureBadge: {
    position: 'absolute',
    top: -4,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3498DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontFamily: Typography.primaryBold,
  },
  statCardLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: Typography.primary,
  },
  tabsContainer: {
    marginBottom: Spacing.md,
  },
  tabsContent: {
    paddingRight: Spacing.lg,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    fontFamily: Typography.primaryMedium,
  },
  tabTextActive: {
    color: '#FFF',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontFamily: Typography.primaryMedium,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Typography.primary,
  },
  transactionAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Typography.primarySemiBold,
  },
  creditAmount: {
    color: '#2ECC71',
  },
  debitAmount: {
    color: '#E74C3C',
  },
  securitySection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '08',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    gap: Spacing.md,
  },
  securityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontFamily: Typography.primarySemiBold,
  },
  securityText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
    fontFamily: Typography.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.9,
  },
  modalGradient: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl * 2 : Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
    marginRight: Spacing.md,
  },
  selectedMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: Typography.primaryBold,
  },
  modalSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: Typography.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontFamily: Typography.primary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginRight: Spacing.xs,
    fontFamily: Typography.primaryBold,
  },
  amountInput: {
    flex: 1,
    fontSize: width < 375 ? 32 : 36,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: Typography.primaryBold,
    padding: 0,
  },
  currencyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    fontFamily: Typography.primary,
  },
  quickAmountsLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontFamily: Typography.primary,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickAmountButton: {
    minWidth: (width - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAmountButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: Typography.primarySemiBold,
  },
  quickAmountTextActive: {
    color: '#FFF',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryTotal: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: Typography.primary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    fontFamily: Typography.primaryMedium,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: Typography.primarySemiBold,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    fontFamily: Typography.primaryBold,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  modalButtonDisabled: {
    backgroundColor: Colors.primary + '80',
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
    fontFamily: Typography.primarySemiBold,
  },
  changeMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
  },
  changeMethodText: {
    fontSize: 15,
    color: Colors.primary,
    fontFamily: Typography.primaryMedium,
  },
  methodsScroll: {
    maxHeight: height * 0.6,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border + '30',
  },
  methodOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  methodOptionInfo: {
    flex: 1,
  },
  methodOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
    fontFamily: Typography.primaryMedium,
  },
  methodOptionDetails: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Typography.primary,
  },
  optionPopularBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: Spacing.sm,
  },
  optionPopularText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: Typography.primaryBold,
  },
  filterButton: {
    padding: Spacing.sm,
  },
});