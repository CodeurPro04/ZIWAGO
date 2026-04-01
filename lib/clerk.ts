import type { AuthSessionLike } from '@/lib/auth';
import { ApiError, syncClerkSession } from '@/lib/api';

export const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || '';

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  if (typeof atob === 'function') {
    return atob(padded);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf8');
  }

  throw new Error('base64_decode_unavailable');
};

export const readJwtPayload = (token: string) => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('invalid_jwt');
  }

  return JSON.parse(decodeBase64Url(parts[1]));
};

export const syncClerkSessionToBackend = async (payload: {
  token: string;
  provider: NonNullable<AuthSessionLike['provider']>;
  role?: 'customer' | 'driver';
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}) => {
  const claims = readJwtPayload(payload.token);
  const clerkUserId = typeof claims?.sub === 'string' ? claims.sub : '';

  if (!clerkUserId) {
    throw new ApiError('Jeton Clerk invalide.', 401);
  }

  const session = await syncClerkSession(
    {
      clerk_user_id: clerkUserId,
      email: payload.email || null,
      first_name: payload.firstName || null,
      last_name: payload.lastName || null,
      phone: payload.phone || null,
      avatar_url: payload.avatarUrl || null,
      role: payload.role || 'customer',
    },
    payload.token
  );

  return {
    ...session,
    token: payload.token,
    provider: payload.provider,
  } satisfies AuthSessionLike;
};
