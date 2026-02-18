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
} from 'react-native';
import { User, Phone, Mail, Save, RefreshCw, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useUserStore } from '@/hooks/useUserData';
import { getUserProfile, mobileLogin, updateUserProfile, uploadUserAvatar } from '@/lib/api';

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
};

export default function ProfileScreen() {
  const updateUserData = useUserStore((state) => state.updateUserData);
  const backendCustomerId = useUserStore((state) => state.backendCustomerId);
  const storePhone = useUserStore((state) => state.phone);
  const firstName = useUserStore((state) => state.firstName);
  const storedAvatarUrl = useUserStore((state) => state.avatarUrl);
  const [userId, setUserId] = useState<number | null>(backendCustomerId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [stats, setStats] = useState({ total_orders: 0, total_spent: 0, pending_orders: 0 });
  const [avatarUrl, setAvatarUrl] = useState(storedAvatarUrl || '');
  const [form, setForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
  });

  const displayName = useMemo(() => {
    const full = `${form.firstName} ${form.lastName}`.trim();
    return full || 'Client';
  }, [form.firstName, form.lastName]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      let resolvedId = userId;
      if (!resolvedId) {
        const login = await mobileLogin({
          role: 'customer',
          phone: storePhone || '+2250700000001',
          name: firstName || 'Client',
        });
        resolvedId = login.user.id;
        setUserId(resolvedId);
        updateUserData('backendCustomerId', resolvedId);
      }

      const profile = await getUserProfile(resolvedId);
      const user = profile.user;
      setForm({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
      setAvatarUrl(user.avatar_url || '');
      setStats({
        total_orders: profile.stats.total_orders || 0,
        total_spent: profile.stats.total_spent || 0,
        pending_orders: profile.stats.pending_orders || 0,
      });
      updateUserData('firstName', user.first_name || '');
      updateUserData('lastName', user.last_name || '');
      updateUserData('email', user.email || '');
      updateUserData('phone', user.phone || '');
      updateUserData('walletBalance', user.wallet_balance || 0);
      updateUserData('avatarUrl', user.avatar_url || '');
    } catch {
      Alert.alert('Erreur', 'Impossible de charger votre profil depuis le backend.');
    } finally {
      setLoading(false);
    }
  }, [firstName, storePhone, updateUserData, userId]);

  useEffect(() => {
    loadProfile().catch(() => undefined);
  }, [loadProfile]);

  const onSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const response = await updateUserProfile(userId, {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        bio: form.bio,
      });

      updateUserData('firstName', response.user.first_name || '');
      updateUserData('lastName', response.user.last_name || '');
      updateUserData('email', response.user.email || '');
      updateUserData('phone', response.user.phone || '');
      updateUserData('walletBalance', response.user.wallet_balance || 0);
      updateUserData('avatarUrl', response.user.avatar_url || '');

      Alert.alert('Succes', 'Profil mis a jour.');
      await loadProfile();
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications.');
    } finally {
      setSaving(false);
    }
  };

  const onPickAvatar = async () => {
    if (!userId) return;
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
      const uploaded = await uploadUserAvatar(userId, result.assets[0].uri);
      setAvatarUrl(uploaded.user.avatar_url || '');
      updateUserData('avatarUrl', uploaded.user.avatar_url || '');
    } catch {
      Alert.alert('Erreur', 'Echec upload photo de profil.');
    } finally {
      setUploadingAvatar(false);
    }
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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <TouchableOpacity style={styles.avatar} onPress={onPickAvatar} activeOpacity={0.8}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} onError={() => setAvatarUrl('')} />
            ) : (
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            )}
            <View style={styles.avatarEditPill}>
              {uploadingAvatar ? <ActivityIndicator size="small" color="#FFF" /> : <Camera size={12} color="#FFF" />}
            </View>
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>{displayName}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total_orders}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending_orders}</Text>
            <Text style={styles.statLabel}>En cours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total_spent.toLocaleString()}</Text>
            <Text style={styles.statLabel}>FCFA depenses</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          <View style={styles.inputRow}>
            <User size={16} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Prenom"
              value={form.firstName}
              onChangeText={(v) => setForm((prev) => ({ ...prev, firstName: v }))}
            />
          </View>

          <View style={styles.inputRow}>
            <User size={16} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Nom"
              value={form.lastName}
              onChangeText={(v) => setForm((prev) => ({ ...prev, lastName: v }))}
            />
          </View>

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

          <TextInput
            style={styles.bioInput}
            placeholder="Bio"
            value={form.bio}
            multiline
            onChangeText={(v) => setForm((prev) => ({ ...prev, bio: v }))}
          />

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => loadProfile().catch(() => undefined)}>
              <RefreshCw size={14} color={Colors.primary} />
              <Text style={styles.secondaryText}>Actualiser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={onSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Save size={14} color="#FFF" />}
              <Text style={styles.primaryText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: Colors.textSecondary, fontSize: 13 },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginRight: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  avatarEditPill: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  headerTextWrap: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text },
  subtitle: { marginTop: 2, fontSize: 12, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.text },
  statLabel: { marginTop: 2, fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  formCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  input: { flex: 1, height: 44, color: Colors.text },
  bioInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    minHeight: 90,
    textAlignVertical: 'top',
    backgroundColor: Colors.surface,
    color: Colors.text,
  },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: 12,
  },
  primaryText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
});
