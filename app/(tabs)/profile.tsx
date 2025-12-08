import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Modal,
  TextInput,
  Animated,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import {
  User,
  MapPin,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Star,
  Shield,
  Globe,
  Moon,
  CreditCard,
  FileText,
  Heart,
  Share2,
  Edit2,
  Camera,
  Lock,
  Eye,
  EyeOff,
  X,
  Check
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  // Données utilisateur fictives
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    phone: '+225 07 00 12 34 56',
    email: 'john.doe@example.com',
    joinDate: '15 Mars 2024',
    membership: 'Premium',
    rating: 4.8,
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4A6FA5&color=fff&size=150',
    bio: 'Passionné de voitures propres et de services de qualité'
  });

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    locationAccess: true,
    biometrics: true,
    marketingEmails: false,
    soundEffects: true
  });

  const [stats, setStats] = useState({
    totalOrders: 24,
    totalSpent: 125400,
    favoriteWasher: 'Marie L.',
    loyaltyPoints: 1250,
    carbonSaved: 12.5,
    waterSaved: 450
  });

  const [editModal, setEditModal] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Sections du menu
  const menuSections = {
    account: [
      { id: 'personal', icon: User, title: 'Informations personnelles', chevron: true },
      { id: 'password', icon: Lock, title: 'Mot de passe', chevron: true },
      { id: 'addresses', icon: MapPin, title: 'Adresses enregistrées', badge: 3, chevron: true },
      { id: 'payment', icon: CreditCard, title: 'Moyens de paiement', badge: 2, chevron: true },
    ],
    preferences: [
      { id: 'notifications', icon: Bell, title: 'Notifications', toggle: true, value: settings.notifications },
      { id: 'darkMode', icon: Moon, title: 'Mode sombre', toggle: true, value: settings.darkMode },
      { id: 'location', icon: Globe, title: 'Localisation', toggle: true, value: settings.locationAccess },
      { id: 'biometrics', icon: Shield, title: 'Authentification biométrique', toggle: true, value: settings.biometrics },
      { id: 'marketing', icon: Mail, title: 'Emails marketing', toggle: true, value: settings.marketingEmails },
      { id: 'sounds', icon: Bell, title: 'Effets sonores', toggle: true, value: settings.soundEffects },
    ],
    support: [
      { id: 'help', icon: HelpCircle, title: 'Centre d\'aide', chevron: true },
      { id: 'terms', icon: FileText, title: 'Conditions d\'utilisation', chevron: true },
      { id: 'privacy', icon: Shield, title: 'Politique de confidentialité', chevron: true },
      { id: 'share', icon: Share2, title: 'Inviter des amis', chevron: true },
      { id: 'rate', icon: Star, title: 'Évaluer l\'application', chevron: true },
    ]
  };

  const handleSettingToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleEditProfile = () => {
    setEditField('profile');
    setEditValue(JSON.stringify(user));
    setEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editField === 'profile') {
      try {
        const updatedUser = JSON.parse(editValue);
        setUser(updatedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setEditModal(false);
    Alert.alert('Succès', 'Modifications enregistrées');
  };

  const handleChangePassword = () => {
    setChangePasswordModal(true);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: () => {
            console.log('User logged out');
            Alert.alert('Déconnecté', 'À bientôt !');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront perdues.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            console.log('Account deleted');
            Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès.');
          }
        }
      ]
    );
  };

  const formatPrice = (price) => {
    return price.toLocaleString() + ' F CFA';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header fixe */}
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Settings size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Section profil */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatar}
                defaultSource={require('@/assets/images/default-avatar.jpeg')}
              />
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Camera size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
                <TouchableOpacity onPress={handleEditProfile}>
                  <Edit2 size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.badge}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.badgeText}>{user.membership}</Text>
              </View>
              
              <Text style={styles.bio}>{user.bio}</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{stats.totalOrders}</Text>
                  <Text style={styles.statLabel}>Commandes</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{user.rating}</Text>
                  <Text style={styles.statLabel}>Note</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{stats.loyaltyPoints}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Informations de contact */}
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Phone size={18} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{user.phone}</Text>
            </View>
            <View style={styles.contactRow}>
              <Mail size={18} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{user.email}</Text>
            </View>
            <View style={styles.contactRow}>
              <Calendar size={18} color={Colors.textSecondary} />
              <Text style={styles.contactText}>Membre depuis {user.joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Navigation entre sections */}
        <View style={styles.sectionNav}>
          <TouchableOpacity 
            style={[styles.sectionBtn, activeSection === 'account' && styles.sectionBtnActive]}
            onPress={() => setActiveSection('account')}
          >
            <Text style={[styles.sectionText, activeSection === 'account' && styles.sectionTextActive]}>
              Compte
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sectionBtn, activeSection === 'preferences' && styles.sectionBtnActive]}
            onPress={() => setActiveSection('preferences')}
          >
            <Text style={[styles.sectionText, activeSection === 'preferences' && styles.sectionTextActive]}>
              Préférences
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sectionBtn, activeSection === 'support' && styles.sectionBtnActive]}
            onPress={() => setActiveSection('support')}
          >
            <Text style={[styles.sectionText, activeSection === 'support' && styles.sectionTextActive]}>
              Support
            </Text>
          </TouchableOpacity>
        </View>

        {/* Menu dynamique selon la section */}
        <View style={styles.menuSection}>
          {menuSections[activeSection].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => {
                if (item.id === 'password') handleChangePassword();
                if (item.id === 'share') Alert.alert('Partager', 'Fonctionnalité à venir');
                if (item.id === 'rate') Alert.alert('Évaluer', 'Fonctionnalité à venir');
              }}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <item.icon size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
                {item.badge && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              
              {item.toggle ? (
                <Switch
                  value={item.value}
                  onValueChange={() => handleSettingToggle(item.id)}
                  trackColor={{ false: '#D1D5DB', true: Colors.primary }}
                  thumbColor="white"
                />
              ) : item.chevron ? (
                <ChevronRight size={20} color={Colors.textSecondary} />
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* Impact écologique */}
        <View style={styles.impactSection}>
          <View style={styles.impactCard}>
            <View style={styles.impactHeader}>
              <Heart size={20} color="#EF4444" />
              <Text style={styles.impactTitle}>Votre impact positif</Text>
            </View>
            <View style={styles.impactStats}>
              <View style={styles.impactStat}>
                <Text style={styles.impactValue}>{stats.carbonSaved} kg</Text>
                <Text style={styles.impactLabel}>CO₂ économisé</Text>
              </View>
              <View style={styles.impactStat}>
                <Text style={styles.impactValue}>{stats.waterSaved} L</Text>
                <Text style={styles.impactLabel}>Eau préservée</Text>
              </View>
            </View>
            <Text style={styles.impactText}>
              Merci pour votre contribution à l'environnement
            </Text>
          </View>
        </View>

        {/* Actions dangereuses */}
        <View style={styles.dangerSection}>
          <TouchableOpacity 
            style={styles.dangerBtn}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.dangerText}>Déconnexion</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dangerBtn, styles.deleteBtn]}
            onPress={handleDeleteAccount}
          >
            <X size={20} color="#EF4444" />
            <Text style={[styles.dangerText, styles.deleteText]}>Supprimer le compte</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.version}>Ziwago v1.0.0 • Build 245</Text>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal d'édition du profil */}
      <Modal
        visible={editModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le profil</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              multiline
              numberOfLines={6}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setEditModal(false)}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSaveEdit}
              >
                <Check size={18} color="white" />
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal changement de mot de passe */}
      <Modal
        visible={changePasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChangePasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Changer le mot de passe</Text>
              <TouchableOpacity onPress={() => setChangePasswordModal(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mot de passe actuel"
                secureTextEntry={!showPassword}
                placeholderTextColor={Colors.textSecondary}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color={Colors.textSecondary} /> : <Eye size={20} color={Colors.textSecondary} />}
              </TouchableOpacity>
            </View>
            
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nouveau mot de passe"
                secureTextEntry={!showPassword}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirmer le nouveau mot de passe"
                secureTextEntry={!showPassword}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.modalBtnPrimary}
              onPress={() => {
                setChangePasswordModal(false);
                Alert.alert('Succès', 'Mot de passe modifié');
              }}
            >
              <Text style={styles.modalBtnPrimaryText}>Modifier le mot de passe</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + Spacing.sm : Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // Section profil
  profileSection: {
    padding: Spacing.md,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  bio: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  contactInfo: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  // Navigation sections
  sectionNav: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  sectionBtnActive: {
    backgroundColor: Colors.primary,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sectionTextActive: {
    color: 'white',
  },
  // Menu
  menuSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '30',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  menuBadge: {
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  // Impact écologique
  impactSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  impactCard: {
    backgroundColor: '#10B98110',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#10B98130',
    gap: Spacing.md,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  impactStats: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  impactStat: {
    flex: 1,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  impactText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  // Actions dangereuses
  dangerSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EF444440',
    gap: Spacing.sm,
  },
  dangerText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '500',
  },
  deleteBtn: {
    backgroundColor: '#EF444410',
  },
  deleteText: {
    fontWeight: '600',
  },
  // Version
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 80 : 60,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalInput: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: 14,
    color: Colors.text,
    minHeight: 120,
    marginBottom: Spacing.lg,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cancelBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
  },
  saveBtnText: {
    fontSize: 15,
    color: 'white',
    fontWeight: '500',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  modalBtnPrimary: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  modalBtnPrimaryText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});