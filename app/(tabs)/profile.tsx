import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Phone,
  Mail,
  Save,
  RefreshCw,
  Camera,
  ClipboardList,
  Clock3,
  Wallet,
  FileText,
  Settings,
  Shield,
  Bell,
  Globe,
  Lock,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useUserStore } from '@/hooks/useUserData';
import { ApiError, getUserProfile, updateUserProfile, uploadUserAvatar } from '@/lib/api';
import { authenticateWithBiometrics, canUseBiometrics, canUseFaceId, getBiometricLabel } from '@/lib/biometrics';

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
};

type ProfileTab = 'profile' | 'settings' | 'security';

const EMPTY_FORM: ProfileForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bio: '',
};

export default function ProfileScreen() {
  const router = useRouter();
  const updateUserData = useUserStore((state) => state.updateUserData);
  const resetUserData = useUserStore((state) => state.resetUserData);
  const backendCustomerId = useUserStore((state) => state.backendCustomerId);
  const storedAvatarUrl = useUserStore((state) => state.avatarUrl);
  const biometricEnabled = useUserStore((state) => state.biometricEnabled);

  const [currentUserId, setCurrentUserId] = useState<number | null>(backendCustomerId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

  const [stats, setStats] = useState({ total_orders: 0, total_spent: 0, pending_orders: 0 });
  const [avatarUrl, setAvatarUrl] = useState(storedAvatarUrl || '');
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [initialForm, setInitialForm] = useState<ProfileForm>(EMPTY_FORM);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometrie');

  const displayName = useMemo(() => {
    const full = `${form.firstName} ${form.lastName}`.trim();
    return full || 'Client';
  }, [form.firstName, form.lastName]);

  const formattedSpent = useMemo(() => `${stats.total_spent.toLocaleString()} FCFA`, [stats.total_spent]);
  const biometricSubtitle = useMemo(() => {
    if (Platform.OS === 'ios') {
      return biometricLabel === 'Face ID'
        ? 'Utiliser Face ID pour deverrouiller votre session'
        : `Utiliser ${biometricLabel} pour deverrouiller votre session`;
    }
    return biometricLabel === 'Biometrie'
      ? 'Utiliser la biometrie de l appareil'
      : `Utiliser ${biometricLabel} pour deverrouiller votre session`;
  }, [biometricLabel]);

  const syncLabel = useMemo(() => {
    if (!lastSyncedAt) return 'Jamais synchronise';
    return `Mis a jour a ${lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [lastSyncedAt]);

  const isDirty = useMemo(
    () =>
      form.firstName !== initialForm.firstName ||
      form.lastName !== initialForm.lastName ||
      form.phone !== initialForm.phone ||
      form.email !== initialForm.email ||
      form.bio !== initialForm.bio,
    [form, initialForm]
  );

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const resolvedId = currentUserId ?? backendCustomerId;
      if (!resolvedId) {
        Alert.alert('Session invalide', 'Veuillez vous reconnecter pour charger votre profil.');
        router.replace('/auth/email');
        return;
      }

      const profile = await getUserProfile(resolvedId);
      const user = profile.user;

      const nextForm = {
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      };

      setForm(nextForm);
      setInitialForm(nextForm);
      setAvatarUrl(user.avatar_url || '');
      setStats({
        total_orders: profile.stats.total_orders || 0,
        total_spent: profile.stats.total_spent || 0,
        pending_orders: profile.stats.pending_orders || 0,
      });
      setLastSyncedAt(new Date());

      updateUserData('firstName', user.first_name || '');
      updateUserData('lastName', user.last_name || '');
      updateUserData('email', user.email || '');
      updateUserData('phone', user.phone || '');
      updateUserData('walletBalance', user.wallet_balance || 0);
      updateUserData('avatarUrl', user.avatar_url || '');
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
        Alert.alert('Session expiree', 'Votre session est invalide. Veuillez vous reconnecter.');
        resetUserData();
        router.replace('/auth/email');
        return;
      }

      const message = error instanceof ApiError ? error.message : 'Impossible de charger votre profil depuis le backend.';
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  }, [backendCustomerId, currentUserId, resetUserData, router, updateUserData]);

  useEffect(() => {
    loadProfile().catch(() => undefined);
  }, [loadProfile]);

  useEffect(() => {
    getBiometricLabel()
      .then((label) => setBiometricLabel(label))
      .catch(() => setBiometricLabel(Platform.OS === 'ios' ? 'Face ID' : 'Biometrie'));
  }, []);

  useEffect(() => {
    if (backendCustomerId && backendCustomerId !== currentUserId) {
      setCurrentUserId(backendCustomerId);
    }
  }, [backendCustomerId, currentUserId]);

  const onSave = async () => {
    const targetUserId = currentUserId ?? backendCustomerId;
    if (!targetUserId) return;
    if (!isDirty) {
      Alert.alert('Info', 'Aucune modification a enregistrer.');
      return;
    }

    setSaving(true);
    try {
      const response = await updateUserProfile(targetUserId, {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        bio: form.bio,
      });

      const nextForm = {
        firstName: response.user.first_name || '',
        lastName: response.user.last_name || '',
        email: response.user.email || '',
        phone: response.user.phone || '',
        bio: response.user.bio || '',
      };

      setForm(nextForm);
      setInitialForm(nextForm);
      setLastSyncedAt(new Date());

      updateUserData('firstName', response.user.first_name || '');
      updateUserData('lastName', response.user.last_name || '');
      updateUserData('email', response.user.email || '');
      updateUserData('phone', response.user.phone || '');
      updateUserData('walletBalance', response.user.wallet_balance || 0);
      updateUserData('avatarUrl', response.user.avatar_url || '');

      Alert.alert('Succes', 'Profil mis a jour.');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications.');
    } finally {
      setSaving(false);
    }
  };

  const onPickAvatar = async () => {
    const targetUserId = currentUserId ?? backendCustomerId;
    if (!targetUserId) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l acces galerie pour changer la photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploadingAvatar(true);
    try {
      const uploaded = await uploadUserAvatar(targetUserId, result.assets[0].uri);
      setAvatarUrl(uploaded.user.avatar_url || '');
      updateUserData('avatarUrl', uploaded.user.avatar_url || '');
      setLastSyncedAt(new Date());
    } catch {
      Alert.alert('Erreur', 'Echec upload photo de profil.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onResetEdits = () => {
    setForm(initialForm);
  };

  const onLogout = () => {
    Alert.alert('Deconnexion', 'Voulez-vous vraiment vous deconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se deconnecter',
        style: 'destructive',
        onPress: () => {
          resetUserData();
          router.replace('/auth/email');
        },
      },
    ]);
  };

  const onToggleBiometric = async (nextValue: boolean) => {
    if (biometricLoading) return;

    if (!nextValue) {
      updateUserData('biometricEnabled', false);
      return;
    }

    setBiometricLoading(true);
    try {
      const available = await canUseBiometrics();
      if (!available) {
        Alert.alert('Biometrie indisponible', 'Aucune methode biométrique configuree sur cet appareil.');
        return;
      }

      const label = await getBiometricLabel();
      if (Platform.OS === 'ios') {
        const faceIdAvailable = await canUseFaceId();
        if (!faceIdAvailable) {
          Alert.alert('Face ID indisponible', 'Face ID n est pas configure sur cet iPhone. Activez Face ID dans les reglages iOS puis reessayez.');
          return;
        }
      }
      const success = await authenticateWithBiometrics(`Activer la connexion ${label}`);
      if (!success) {
        Alert.alert('Activation annulee', `${label} n a pas ete valide.`);
        return;
      }

      updateUserData('biometricEnabled', true);
      Alert.alert('Securite activee', `Connexion ${label} activee avec succes.`);
    } catch {
      Alert.alert('Erreur', 'Impossible d activer la biometrie pour le moment.');
    } finally {
      setBiometricLoading(false);
    }
  };

  const openInfoAlert = (title: string) => {
    Alert.alert(title, 'Cette option sera bientot disponible.');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient colors={['#5FA9F8', '#2F7FD8']} style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroEyebrow}>Mon profil</Text>
            <Text style={styles.heroTitle}>Espace personnel</Text>
          </View>

          <View style={styles.heroBody}>
            <TouchableOpacity style={styles.avatar} onPress={onPickAvatar} activeOpacity={0.85}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} onError={() => setAvatarUrl('')} />
              ) : (
                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              )}
              <View style={styles.avatarEditPill}>
                {uploadingAvatar ? <ActivityIndicator size="small" color="#FFF" /> : <Camera size={12} color="#FFF" />}
              </View>
            </TouchableOpacity>

            <View style={styles.identityWrap}>
              <Text style={styles.identityName}>{displayName}</Text>
              <Text style={styles.identityMeta}>{form.phone || 'Numero non renseigne'}</Text>
              <Text style={styles.identityMeta}>{form.email || 'Email non renseigne'}</Text>
            </View>
          </View>

          <View style={styles.heroFooter}>
            <Text style={styles.syncText}>{syncLabel}</Text>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <ClipboardList size={16} color={Colors.primary} />
            <Text style={styles.statValue}>{stats.total_orders}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>

          <View style={styles.statCard}>
            <Clock3 size={16} color={Colors.primary} />
            <Text style={styles.statValue}>{stats.pending_orders}</Text>
            <Text style={styles.statLabel}>En cours</Text>
          </View>

          <View style={styles.statCard}>
            <Wallet size={16} color={Colors.primary} />
            <Text style={styles.statValueSmall}>{formattedSpent}</Text>
            <Text style={styles.statLabel}>Depenses</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
            onPress={() => setActiveTab('profile')}
          >
            <User size={14} color={activeTab === 'profile' ? '#FFFFFF' : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>Profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'settings' && styles.tabButtonActive]}
            onPress={() => setActiveTab('settings')}
          >
            <Settings size={14} color={activeTab === 'settings' ? '#FFFFFF' : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>Parametres</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'security' && styles.tabButtonActive]}
            onPress={() => setActiveTab('security')}
          >
            <Shield size={14} color={activeTab === 'security' ? '#FFFFFF' : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'security' && styles.tabTextActive]}>Securite</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'profile' && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            <Text style={styles.sectionHint}>Mettez a jour vos coordonnees puis enregistrez.</Text>

            <Text style={styles.inputLabel}>Prenom</Text>
            <View style={styles.inputRow}>
              <User size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Prenom"
                value={form.firstName}
                onChangeText={(v) => setForm((prev) => ({ ...prev, firstName: v }))}
              />
            </View>

            <Text style={styles.inputLabel}>Nom</Text>
            <View style={styles.inputRow}>
              <User size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Nom"
                value={form.lastName}
                onChangeText={(v) => setForm((prev) => ({ ...prev, lastName: v }))}
              />
            </View>

            <Text style={styles.inputLabel}>Telephone</Text>
            <View style={styles.inputRow}>
              <Phone size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Telephone"
                value={form.phone}
                keyboardType="phone-pad"
                onChangeText={(v) => setForm((prev) => ({ ...prev, phone: v }))}
              />
            </View>

            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputRow}>
              <Mail size={16} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={form.email}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(v) => setForm((prev) => ({ ...prev, email: v }))}
              />
            </View>

            <View style={styles.bioHeader}>
              <FileText size={16} color={Colors.textSecondary} />
              <Text style={styles.inputLabelNoMargin}>Bio</Text>
            </View>
            <TextInput
              style={styles.bioInput}
              placeholder="Parlez brievement de vous"
              value={form.bio}
              multiline
              numberOfLines={4}
              onChangeText={(v) => setForm((prev) => ({ ...prev, bio: v }))}
            />
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Parametres de compte</Text>
            <Text style={styles.sectionHint}>Personnalisez votre experience et vos preferences.</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingIconWrap}>
                <Bell size={16} color={Colors.primary} />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingTitle}>Notifications push</Text>
                <Text style={styles.settingSubtitle}>Recevoir les updates de reservation</Text>
              </View>
              <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#D1D5DB', true: '#BFD8F8' }} thumbColor={pushEnabled ? Colors.primary : '#FFFFFF'} />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingIconWrap}>
                <Mail size={16} color={Colors.primary} />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingTitle}>Notifications email</Text>
                <Text style={styles.settingSubtitle}>Resumes et promotions</Text>
              </View>
              <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ false: '#D1D5DB', true: '#BFD8F8' }} thumbColor={emailEnabled ? Colors.primary : '#FFFFFF'} />
            </View>

            <TouchableOpacity style={styles.linkRow} onPress={() => openInfoAlert('Langue')}>
              <View style={styles.linkLeft}>
                <Globe size={16} color={Colors.primary} />
                <Text style={styles.linkLabel}>Langue de l application</Text>
              </View>
              <ChevronRight size={16} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkRow} onPress={() => openInfoAlert('Confidentialite')}>
              <View style={styles.linkLeft}>
                <Lock size={16} color={Colors.primary} />
                <Text style={styles.linkLabel}>Confidentialite et donnees</Text>
              </View>
              <ChevronRight size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'security' && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Securite et session</Text>
            <Text style={styles.sectionHint}>Gerez votre session et les actions sensibles.</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingIconWrap}>
                <Shield size={16} color={Colors.primary} />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingTitle}>Connexion biometrique</Text>
                <Text style={styles.settingSubtitle}>{biometricSubtitle}</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={onToggleBiometric}
                disabled={biometricLoading}
                trackColor={{ false: '#D1D5DB', true: '#BFD8F8' }}
                thumbColor={biometricEnabled ? Colors.primary : '#FFFFFF'}
              />
            </View>

            <TouchableOpacity style={styles.linkRow} onPress={onPickAvatar}>
              <View style={styles.linkLeft}>
                <Camera size={16} color={Colors.primary} />
                <Text style={styles.linkLabel}>Changer la photo de profil</Text>
              </View>
              <ChevronRight size={16} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkRow} onPress={() => openInfoAlert('Mot de passe')}>
              <View style={styles.linkLeft}>
                <Shield size={16} color={Colors.primary} />
                <Text style={styles.linkLabel}>Mise a jour des identifiants</Text>
              </View>
              <ChevronRight size={16} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <LogOut size={16} color="#FFFFFF" />
              <Text style={styles.logoutText}>Se deconnecter</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => loadProfile().catch(() => undefined)}>
            <RefreshCw size={14} color={Colors.primary} />
            <Text style={styles.secondaryText}>Actualiser</Text>
          </TouchableOpacity>

          {activeTab === 'profile' ? (
            <TouchableOpacity
              style={[styles.primaryButton, (!isDirty || saving) && styles.primaryButtonDisabled]}
              onPress={onSave}
              disabled={saving || !isDirty}
            >
              {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Save size={14} color="#FFF" />}
              <Text style={styles.primaryText}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={() => setActiveTab('profile')}>
              <User size={14} color="#FFF" />
              <Text style={styles.primaryText}>Modifier le profil</Text>
            </TouchableOpacity>
          )}
        </View>

        {activeTab === 'profile' && isDirty && (
          <TouchableOpacity style={styles.resetEditsButton} onPress={onResetEdits}>
            <Text style={styles.resetEditsText}>Annuler les modifications non enregistrees</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF3F9' },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 120, gap: Spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: Colors.textSecondary, fontSize: 13 },

  heroCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: '#1A4F86',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  heroHeader: { gap: 2 },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  heroBody: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    paddingTop: Spacing.sm,
  },
  syncText: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A6AB1',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  avatarEditPill: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  identityWrap: { flex: 1, gap: 2 },
  identityName: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  identityMeta: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },

  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECF3',
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.text },
  statValueSmall: { fontSize: 14, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  statLabel: { marginTop: 2, fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },

  tabRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E6ECF3',
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  formCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECF3',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  sectionHint: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },

  inputLabel: { fontSize: 12, fontWeight: '700', color: '#435264', marginTop: 4 },
  inputLabelNoMargin: { fontSize: 12, fontWeight: '700', color: '#435264' },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#D9E2EE',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: '#F8FAFC',
  },
  input: { flex: 1, height: 48, color: Colors.text, fontSize: 14 },
  bioInput: {
    borderWidth: 1,
    borderColor: '#D9E2EE',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F8FAFC',
    color: Colors.text,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E6ECF3',
    borderRadius: BorderRadius.md,
    backgroundColor: '#FAFCFF',
    padding: Spacing.sm,
  },
  settingIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF3FF',
  },
  settingTextWrap: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  settingSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E6ECF3',
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 12,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  linkLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },

  logoutButton: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E24646',
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 2 },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#D5E0EE',
  },
  secondaryText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },

  resetEditsButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  resetEditsText: {
    color: '#5C6E84',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
