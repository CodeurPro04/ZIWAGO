import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ApiError, buildOAuthStartUrl, completeOAuth, loginWithEmail, registerWithEmail } from '@/lib/api';
import { applyAuthSessionToStore, getPostAuthRoute, isValidEmail, secureRandomState, validateStrongPassword } from '@/lib/auth';

type AuthMode = 'login' | 'register';

const MAX_FAILS = 5;
const LOCK_SECONDS = 180;
WebBrowser.maybeCompleteAuthSession();

export default function EmailAuthScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const lockRemaining = isLocked ? Math.ceil((lockedUntil! - Date.now()) / 1000) : 0;

  const canSubmit = useMemo(() => {
    if (loading || isLocked || oauthLoading) return false;
    if (!isValidEmail(email)) return false;
    if (!password) return false;
    if (mode === 'register' && (!firstName.trim() || !lastName.trim())) return false;
    if (mode === 'register' && password !== confirmPassword) return false;
    return true;
  }, [loading, isLocked, oauthLoading, email, password, mode, firstName, lastName, confirmPassword]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (mode === 'register') {
      const passwordError = validateStrongPassword(password);
      if (passwordError) {
        Alert.alert('Mot de passe faible', passwordError);
        return;
      }
    }

    setLoading(true);
    try {
      const session =
        mode === 'login'
          ? await loginWithEmail({ email: email.trim().toLowerCase(), password, role: 'customer' })
          : await registerWithEmail({
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              email: email.trim().toLowerCase(),
              password,
              role: 'customer',
            });

      applyAuthSessionToStore(session);
      router.replace(getPostAuthRoute(session));
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          const attempts = failedAttempts + 1;
          setFailedAttempts(attempts);

          if (attempts >= MAX_FAILS) {
            const until = Date.now() + LOCK_SECONDS * 1000;
            setLockedUntil(until);
            Alert.alert('Compte temporairement bloque', `Trop d erreurs. Reessayez dans ${LOCK_SECONDS} secondes.`);
            return;
          }

          Alert.alert('Connexion refusee', `Identifiants invalides. Tentatives restantes: ${MAX_FAILS - attempts}.`);
          return;
        }

        if (error.status === 422) {
          Alert.alert('Donnees invalides', error.message || 'Veuillez verifier les champs saisis.');
          return;
        }

        Alert.alert('Erreur serveur', error.message || 'Le serveur a renvoye une erreur.');
        return;
      }

      Alert.alert('Erreur reseau', 'Impossible de joindre le backend. Verifiez API et connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    if (oauthLoading || loading) return;

    const state = secureRandomState();
    const redirectUri = Linking.createURL('/auth/callback');
    const authUrl = buildOAuthStartUrl(provider, redirectUri, state);

    setOauthLoading(provider);
    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      if (result.type !== 'success' || !result.url) return;

      const parsed = Linking.parse(result.url);
      const params = parsed.queryParams || {};

      if (params.state !== state) {
        throw new Error('invalid_oauth_state');
      }

      const code = typeof params.code === 'string' ? params.code : null;
      const idToken = typeof params.id_token === 'string' ? params.id_token : null;
      const accessToken = typeof params.access_token === 'string' ? params.access_token : null;

      if (!code && !idToken && !accessToken) {
        throw new Error('missing_oauth_token');
      }

      const session = await completeOAuth({
        provider,
        code,
        id_token: idToken,
        access_token: accessToken,
        redirect_uri: redirectUri,
        state,
      });

      applyAuthSessionToStore(session);
      router.replace(getPostAuthRoute(session));
    } catch {
      Alert.alert('Connexion impossible', `Echec de connexion ${provider === 'google' ? 'Google' : 'Apple'}.`);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Connexion Client</Text>
          <Text style={styles.subtitle}>Connectez-vous avec Email, Google ou Apple.</Text>

          <View style={styles.modeRow}>
            <TouchableOpacity style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]} onPress={() => setMode('login')}>
              <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>Connexion</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modeButton, mode === 'register' && styles.modeButtonActive]} onPress={() => setMode('register')}>
              <Text style={[styles.modeText, mode === 'register' && styles.modeTextActive]}>Inscription</Text>
            </TouchableOpacity>
          </View>

          {mode === 'register' ? (
            <>
              <Input
                placeholder="Prenom"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                placeholderTextColor={Colors.textSecondary}
              />
              <Input
                placeholder="Nom"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                placeholderTextColor={Colors.textSecondary}
              />
            </>
          ) : null}

          <Input
            placeholder="Adresse email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor={Colors.textSecondary}
          />

          <Input
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor={Colors.textSecondary}
          />

          {mode === 'register' ? (
            <Input
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor={Colors.textSecondary}
            />
          ) : null}

          {isLocked ? <Text style={styles.lockText}>Reessayez dans {lockRemaining}s</Text> : null}

          <Button
            title={loading ? 'Connexion...' : mode === 'login' ? 'Se connecter' : 'Creer un compte'}
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={styles.submitButton}
          />

          <Text style={styles.orText}>ou</Text>

          <TouchableOpacity style={styles.socialButton} disabled={Boolean(oauthLoading || loading)} onPress={() => handleOAuth('apple')}>
            <View style={styles.socialButtonContent}>
              {oauthLoading === 'apple' ? <ActivityIndicator size="small" color="#000" /> : <Icon name="apple" size={22} color="#000" />}
              <Text style={styles.socialButtonText}>Continuer avec Apple</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} disabled={Boolean(oauthLoading || loading)} onPress={() => handleOAuth('google')}>
            <View style={styles.socialButtonContent}>
              {oauthLoading === 'google' ? <ActivityIndicator size="small" color="#DB4437" /> : <Icon name="google" size={22} color="#DB4437" />}
              <Text style={styles.socialButtonText}>Continuer avec Google</Text>
            </View>
          </TouchableOpacity>

          {loading ? <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  title: {
    ...Typography.title,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  socialButton: {
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  orText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    marginVertical: Spacing.lg,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  input: {
    marginBottom: Spacing.md,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  lockText: {
    fontSize: 13,
    color: '#B45309',
    marginBottom: Spacing.sm,
  },
  loader: {
    marginTop: Spacing.md,
  },
});
