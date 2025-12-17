import React, { useState, useEffect } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
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
  EyeOff
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

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
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Méthodes de recharge
  const paymentMethods = [
    {
      id: 1,
      name: 'Orange Money',
      icon: 'SmartphoneCharging',
      color: '#FF6B35',
      type: 'mobile',
      number: '•••• 7845',
      commission: '0.5%'
    },
    {
      id: 2,
      name: 'MTN Money',
      icon: 'MTNIcon',
      color: '#FFCC00',
      type: 'mobile',
      number: '•••• 9231',
      commission: '0.5%'
    },
    {
      id: 3,
      name: 'Moov Money',
      icon: 'MoovIcon',
      color: '#00A859',
      type: 'mobile',
      number: '•••• 4567',
      commission: '0.5%'
    },
    {
      id: 4,
      name: 'Wave',
      icon: 'Wifi',
      color: '#2D5BFF',
      type: 'mobile',
      number: '•••• 8910',
      commission: '1%'
    },
    {
      id: 5,
      name: 'Carte Bancaire',
      icon: 'CreditCard',
      color: '#3498DB',
      type: 'card',
      number: '•••• 4321',
      commission: '1.5%'
    }
  ];

  useEffect(() => {
    loadBalanceVisibility();
    generateMockTransactions();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
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
        color: '#FF6B35'
      },
      {
        id: 2,
        type: 'debit',
        amount: 2500,
        description: 'Lavage voiture - Renault Clio',
        date: 'Hier, 10:15',
        status: 'completed',
        icon: 'Car',
        color: Colors.primary
      },
      {
        id: 3,
        type: 'credit',
        amount: 10000,
        description: 'Recharge MTN Money',
        date: '15 Mars, 09:45',
        status: 'completed',
        icon: 'MTNIcon',
        color: '#FFCC00'
      },
      {
        id: 4,
        type: 'debit',
        amount: 3500,
        description: 'Nettoyage intérieur',
        date: '12 Mars, 16:20',
        status: 'completed',
        icon: 'clean',
        color: Colors.primary
      },
      {
        id: 5,
        type: 'debit',
        amount: 4500,
        description: 'Lavage premium',
        date: '10 Mars, 11:30',
        status: 'failed',
        icon: 'Car',
        color: '#E74C3C'
      },
      {
        id: 6,
        type: 'credit',
        amount: 20000,
        description: 'Recharge carte bancaire',
        date: '8 Mars, 14:00',
        status: 'completed',
        icon: 'CreditCard',
        color: '#3498DB'
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
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    const amount = parseInt(rechargeAmount);
    const commission = selectedMethod ? 
      (amount * parseFloat(selectedMethod.commission) / 100) : 0;
    const total = amount - commission;
    
    setIsLoading(true);
    setTimeout(() => {
      const newBalance = balance + total;
      setBalance(newBalance);
      
      const newTransaction = {
        id: transactions.length + 1,
        type: 'credit',
        amount: total,
        description: `Recharge ${selectedMethod?.name || ''}`,
        date: 'Maintenant',
        status: 'completed',
        icon: selectedMethod?.icon || 'CreditCard',
        color: selectedMethod?.color || '#3498DB'
      };
      
      setTransactions([newTransaction, ...transactions]);
      setRechargeAmount('');
      setSelectedMethod(null);
      setShowRechargeModal(false);
      setIsLoading(false);
      
      Alert.alert(
        'Succès', 
        `Recharge effectuée !\nMontant: ${amount.toLocaleString()} F CFA\nCommission: ${commission.toLocaleString()} F CFA\nSolde crédité: ${total.toLocaleString()} F CFA`
      );
    }, 2000);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(withdrawAmount) || parseInt(withdrawAmount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    const amount = parseInt(withdrawAmount);
    
    if (amount > balance) {
      Alert.alert('Erreur', 'Solde insuffisant');
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
        color: '#E74C3C'
      };
      
      setTransactions([newTransaction, ...transactions]);
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      setIsLoading(false);
      
      Alert.alert('Demande envoyée', 'Votre retrait sera traité dans les 24h');
    }, 1500);
  };

  const getIconComponent = (iconName, color = "white", size = 20) => {
    switch(iconName) {
      case 'SmartphoneCharging': return <SmartphoneCharging size={size} color={color} />;
      case 'CreditCard': return <CreditCard size={size} color={color} />;
      case 'Gift': return <Gift size={size} color={color} />;
      case 'Car': return <Car size={size} color={color} />;
      case 'clean': return <Shield size={size} color={color} />;
      case 'Wifi': return <Wifi size={size} color={color} />;
      case 'MoovIcon': return <MoovIcon size={size} color={color} />;
      case 'MTNIcon': return <MTNIcon size={size} color={color} />;
      case 'bank': return <Banknote size={size} color={color} />;
      case 'plus': return <Plus size={size} color={color} />;
      default: return <Wallet size={size} color={color} />;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} color="#2ECC71" />;
      case 'pending': return <Clock size={16} color="#F39C12" />;
      case 'failed': return <XCircle size={16} color="#E74C3C" />;
      default: return <AlertCircle size={16} color="#95A5A6" />;
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
            <View style={styles.balanceDot} />
            <View style={styles.balanceDot} />
            <View style={styles.balanceDot} />
            <View style={styles.balanceDot} />
            <View style={styles.balanceDot} />
            <View style={styles.balanceDot} />
            <View style={styles.balanceDot} />
            <View style={styles.balanceDot} />
          </View>
          <Text style={styles.hiddenBalanceText}>F CFA</Text>
        </View>
      );
    }
    return (
      <Text style={styles.balanceAmount}>{formatAmount(balance)}</Text>
    );
  };

  const renderPaymentMethods = () => (
    <View style={styles.paymentMethodsGrid}>
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={styles.paymentMethodCard}
          onPress={() => handleMethodSelection(method)}
          activeOpacity={0.7}
        >
          <View style={[styles.methodIconContainer, { backgroundColor: method.color + '20' }]}>
            {getIconComponent(method.icon, method.color, 24)}
          </View>
          <Text style={styles.methodName} numberOfLines={1}>{method.name}</Text>
          <Text style={styles.methodCommission}>{method.commission} commission</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.titleContainer}>
                  <Wallet size={28} color={Colors.primary} />
                  <Text style={styles.title}>Portefeuille</Text>
                </View>
                <TouchableOpacity 
                  style={styles.historyButton}
                  onPress={() => Alert.alert('Historique complet', 'Fonctionnalité à venir')}
                >
                  <History size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
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
                />
              }
            >
              {/* Carte Solde */}
              <View style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceLabel}>Solde disponible</Text>
                  <View style={styles.balanceHeaderActions}>
                    <TouchableOpacity 
                      onPress={toggleBalanceVisibility}
                      style={styles.visibilityButton}
                    >
                      {balanceHidden ? (
                        <EyeOff size={18} color={Colors.textSecondary} />
                      ) : (
                        <Eye size={18} color={Colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => Alert.alert('ID Copié', 'Votre ID a été copié')}
                      style={styles.copyButton}
                    >
                      <Copy size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {renderBalance()}
                
                <View style={styles.balanceStats}>
                  <View style={styles.statItem}>
                    <ArrowDownLeft size={16} color="#2ECC71" />
                    <Text style={[styles.statText, styles.statPositive]}>
                      {balanceHidden ? '••••' : '+65,400 F'}
                    </Text>
                    <Text style={styles.statLabel}>Ce mois</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <ArrowUpRight size={16} color="#E74C3C" />
                    <Text style={[styles.statText, styles.statNegative]}>
                      {balanceHidden ? '••••' : '-28,500 F'}
                    </Text>
                    <Text style={styles.statLabel}>Dépenses</Text>
                  </View>
                </View>
              </View>

              {/* Actions rapides */}
              <View style={styles.quickActions}>
                <TouchableOpacity 
                  style={styles.quickAction}
                  onPress={() => setShowRechargeModal(true)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#2ECC71' }]}>
                    <Plus size={24} color="white" />
                  </View>
                  <Text style={styles.actionText}>Recharger</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickAction}
                  onPress={() => setShowWithdrawModal(true)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#3498DB' }]}>
                    <Send size={24} color="white" />
                  </View>
                  <Text style={styles.actionText}>Envoyer</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickAction}
                  onPress={() => Alert.alert('QR Code', 'Fonctionnalité à venir')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIcon, { backgroundColor: '#8E44AD' }]}>
                    <QrCode size={24} color="white" />
                  </View>
                  <Text style={styles.actionText}>QR Code</Text>
                </TouchableOpacity>
              </View>

              {/* Méthodes de recharge */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Méthodes de recharge</Text>
                {renderPaymentMethods()}
              </View>

              {/* Statistiques */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Statistiques du mois</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statCardValue}>{transactions.length}</Text>
                    <Text style={styles.statCardLabel}>Transactions</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statCardValue}>
                      {balanceHidden ? '••••' : '65,400 F'}
                    </Text>
                    <Text style={styles.statCardLabel}>Recharges</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statCardValue}>
                      {balanceHidden ? '••••' : '28,500 F'}
                    </Text>
                    <Text style={styles.statCardLabel}>Dépenses</Text>
                  </View>
                </View>
              </View>

              {/* Transactions récentes */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Transactions récentes</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>Tout voir</Text>
                  </TouchableOpacity>
                </View>
                
                {transactions.map((transaction) => (
                  <TouchableOpacity 
                    key={transaction.id}
                    style={styles.transactionItem}
                    activeOpacity={0.7}
                    onPress={() => Alert.alert('Détails', transaction.description)}
                  >
                    <View style={[styles.transactionIcon, { backgroundColor: transaction.color }]}>
                      {getIconComponent(transaction.icon)}
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
                        {balanceHidden ? ' ••••' : ` ${formatAmount(transaction.amount)}`}
                      </Text>
                      <ChevronRight size={16} color={Colors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sécurité 
              <View style={styles.securityCard}>
                <Shield size={24} color={Colors.primary} />
                <View style={styles.securityInfo}>
                  <Text style={styles.securityTitle}>Protection Ziwago</Text>
                  <Text style={styles.securityText}>
                    Toutes vos transactions sont sécurisées et cryptées
                  </Text>
                </View>
              </View> */}

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
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKeyboardAvoid}
              >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <View style={styles.modalTitleContainer}>
                          {selectedMethod && (
                            <View style={[styles.selectedMethodIcon, { backgroundColor: selectedMethod.color + '20' }]}>
                              {getIconComponent(selectedMethod.icon, selectedMethod.color, 20)}
                            </View>
                          )}
                          <Text style={styles.modalTitle}>
                            {selectedMethod ? `Recharger avec ${selectedMethod.name}` : 'Choisir un montant'}
                          </Text>
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
                          <Text style={styles.modalSubtitle}>Montant à recharger (F CFA)</Text>
                          
                          <View style={styles.amountInputContainer}>
                            <TextInput
                              style={styles.amountInput}
                              value={rechargeAmount}
                              onChangeText={setRechargeAmount}
                              placeholder="0"
                              keyboardType="numeric"
                              placeholderTextColor={Colors.textSecondary}
                              autoFocus={true}
                            />
                            <Text style={styles.currencyText}>F CFA</Text>
                          </View>
                          
                          <View style={styles.quickAmounts}>
                            {[1000, 2000, 5000, 10000, 20000, 50000].map((amount) => (
                              <TouchableOpacity
                                key={amount}
                                style={styles.quickAmountButton}
                                onPress={() => setRechargeAmount(amount.toString())}
                              >
                                <Text style={styles.quickAmountText}>{amount.toLocaleString()}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          
                          <View style={styles.commissionInfo}>
                            <Text style={styles.commissionText}>
                              Commission: {selectedMethod.commission} (min 50 F CFA)
                            </Text>
                          </View>
                          
                          <TouchableOpacity 
                            style={[styles.modalButton, isLoading && styles.modalButtonDisabled]}
                            onPress={handleRecharge}
                            disabled={isLoading || !rechargeAmount}
                          >
                            {isLoading ? (
                              <ActivityIndicator color="white" />
                            ) : (
                              <Text style={styles.modalButtonText}>
                                {rechargeAmount ? 
                                  `Recharger ${parseInt(rechargeAmount).toLocaleString()} F CFA` : 
                                  'Entrez un montant'
                                }
                              </Text>
                            )}
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.changeMethodButton}
                            onPress={() => setSelectedMethod(null)}
                          >
                            <Text style={styles.changeMethodText}>Changer de méthode</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <Text style={styles.modalSubtitle}>Choisissez votre méthode de paiement</Text>
                          {renderPaymentMethods()}
                        </>
                      )}
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </Modal>

            {/* Modal Retrait */}
            <Modal
              visible={showWithdrawModal}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowWithdrawModal(false)}
            >
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKeyboardAvoid}
              >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Retirer des fonds</Text>
                        <TouchableOpacity 
                          onPress={() => setShowWithdrawModal(false)}
                          style={styles.closeButton}
                        >
                          <X size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                      
                      <Text style={styles.modalSubtitle}>Montant à retirer (F CFA)</Text>
                      
                      <View style={styles.amountInputContainer}>
                        <TextInput
                          style={styles.amountInput}
                          value={withdrawAmount}
                          onChangeText={setWithdrawAmount}
                          placeholder="0"
                          keyboardType="numeric"
                          placeholderTextColor={Colors.textSecondary}
                          autoFocus={true}
                        />
                        <Text style={styles.currencyText}>F CFA</Text>
                      </View>
                      
                      <Text style={styles.balanceInfo}>
                        Solde disponible : {balanceHidden ? '••••••••' : formatAmount(balance)}
                      </Text>
                      
                      <View style={styles.quickAmounts}>
                        {[5000, 10000, 20000, 50000, 100000].map((amount) => (
                          <TouchableOpacity
                            key={amount}
                            style={[
                              styles.quickAmountButton,
                              amount > balance && styles.disabledAmountButton
                            ]}
                            onPress={() => amount <= balance && setWithdrawAmount(amount.toString())}
                            disabled={amount > balance}
                          >
                            <Text style={[
                              styles.quickAmountText,
                              amount > balance && styles.disabledAmountText
                            ]}>
                              {amount.toLocaleString()}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      
                      <TouchableOpacity 
                        style={[
                          styles.modalButton, 
                          (isLoading || !withdrawAmount || parseInt(withdrawAmount) > balance) && styles.modalButtonDisabled
                        ]}
                        onPress={handleWithdraw}
                        disabled={isLoading || !withdrawAmount || parseInt(withdrawAmount) > balance}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text style={styles.modalButtonText}>
                            {withdrawAmount ? 
                              `Retirer ${parseInt(withdrawAmount).toLocaleString()} F CFA` : 
                              'Entrez un montant'
                            }
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </Modal>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Composants temporaires
const Car = (props) => <Text style={{ fontSize: props.size || 20 }}>🚗</Text>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '30',
    backgroundColor: 'white',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: Typography.primaryBold,
  },
  historyButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  balanceCard: {
    backgroundColor: 'white',
    margin: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceHeaderActions: {
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
  balanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Typography.primary,
  },
  balanceAmount: {
    fontSize: width < 375 ? 32 : 40,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.lg,
    fontFamily: Typography.primaryBold,
  },
  hiddenBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.lg,
  },
  hiddenBalanceDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  balanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text,
    marginHorizontal: 2,
  },
  hiddenBalanceText: {
    fontSize: width < 375 ? 28 : 36,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    fontFamily: Typography.primaryBold,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '30',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.xs,
    fontFamily: Typography.primarySemiBold,
  },
  statPositive: {
    color: '#2ECC71',
  },
  statNegative: {
    color: '#E74C3C',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: Typography.primary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border + '30',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    minWidth: 70,
  },
  actionIcon: {
    width: width < 375 ? 48 : 56,
    height: width < 375 ? 48 : 56,
    borderRadius: width < 375 ? 24 : 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: Typography.primaryMedium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
    fontFamily: Typography.primaryBold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    fontFamily: Typography.primaryMedium,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  paymentMethodCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2.5,
    backgroundColor: 'white',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border + '20',
    marginBottom: Spacing.sm,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Typography.primaryMedium,
  },
  methodCommission: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: Typography.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border + '30',
    minHeight: 80,
  },
  statCardValue: {
    fontSize: 18,
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
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border + '20',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionDescription: {
    fontSize: 14,
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
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Typography.primary,
  },
  transactionAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.primarySemiBold,
  },
  creditAmount: {
    color: '#2ECC71',
  },
  debitAmount: {
    color: '#E74C3C',
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    gap: Spacing.md,
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
  modalKeyboardAvoid: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl * 2 : Spacing.xl,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.md,
  },
  selectedMethodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    fontFamily: Typography.primaryBold,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    fontFamily: Typography.primary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  amountInput: {
    flex: 1,
    fontSize: width < 375 ? 28 : 32,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: Typography.primaryBold,
    padding: 0,
  },
  currencyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    fontFamily: Typography.primary,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickAmountButton: {
    minWidth: (width - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabledAmountButton: {
    opacity: 0.5,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    fontFamily: Typography.primaryMedium,
  },
  disabledAmountText: {
    color: Colors.textSecondary,
  },
  commissionInfo: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  commissionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: Typography.primary,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalButtonDisabled: {
    backgroundColor: Colors.primary + '80',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: Typography.primarySemiBold,
  },
  changeMethodButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  changeMethodText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: Typography.primaryMedium,
  },
  balanceInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontFamily: Typography.primary,
  },
});