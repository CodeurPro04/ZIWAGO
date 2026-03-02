import { useUserStore } from '@/hooks/useUserData';
import type { Href } from 'expo-router';

export type AuthSessionLike = {
  user: {
    id: number;
    phone?: string | null;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
    wallet_balance?: number;
    account_step?: number;
  };
  token?: string | null;
  is_new_user?: boolean;
  provider?: 'phone' | 'email' | 'google' | 'apple';
};

export const applyAuthSessionToStore = (session: AuthSessionLike) => {
  const updateUserData = useUserStore.getState().updateUserData;

  updateUserData('isAuthenticated', true);
  updateUserData('authProvider', session.provider || null);
  updateUserData('authToken', session.token || null);
  updateUserData('backendCustomerId', session.user.id);
  updateUserData('phone', session.user.phone || '');
  updateUserData('email', session.user.email || '');
  updateUserData('firstName', session.user.first_name || '');
  updateUserData('lastName', session.user.last_name || '');
  updateUserData('avatarUrl', session.user.avatar_url || '');
  updateUserData('walletBalance', session.user.wallet_balance || 0);
  updateUserData('onboardingCompleted', true);
};

export const getPostAuthRoute = (session: AuthSessionLike): Href => {
  const onboardingCompleted = useUserStore.getState().onboardingCompleted;
  const hasIdentity = Boolean(session.user.first_name && session.user.last_name);
  const step = Number(session.user.account_step || 0);

  if (onboardingCompleted || hasIdentity || step >= 2) {
    return '/(tabs)';
  }
  return '/onboarding/step2';
};

export const normalizePhoneDigits = (value: string) => value.replace(/\D/g, '');

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const validateStrongPassword = (value: string) => {
  const password = value.trim();
  if (password.length < 8) return '8 caracteres minimum';
  if (!/[A-Z]/.test(password)) return '1 majuscule requise';
  if (!/[a-z]/.test(password)) return '1 minuscule requise';
  if (!/\d/.test(password)) return '1 chiffre requis';
  return null;
};

export const secureRandomState = () => {
  const seed = `${Date.now()}-${Math.random()}-${Math.random()}`;
  return seed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
};
