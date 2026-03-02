import Constants from 'expo-constants';

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const resolveApiBaseUrl = () => {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : null;
  if (host) {
    return `http://${host}:8000/api`;
  }

  return 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = resolveApiBaseUrl();
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const absolutizeMediaUrl = (value?: string | null): string | null => {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;

  const isAbsolute = /^https?:\/\//i.test(raw);
  if (!isAbsolute) {
    const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
    return `${API_ORIGIN}${normalizedPath}`;
  }

  try {
    const source = new URL(raw);
    if (source.hostname === '127.0.0.1' || source.hostname === 'localhost') {
      const target = new URL(API_ORIGIN);
      source.protocol = target.protocol;
      source.hostname = target.hostname;
      source.port = target.port;
      return source.toString();
    }
    return source.toString();
  } catch {
    return raw;
  }
};

type MobileUser = {
  id: number;
  name: string;
  phone: string;
  role: 'customer' | 'driver';
  wallet_balance: number;
  is_available: boolean;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  membership?: string | null;
  rating?: number;
  profile_status?: string;
  account_step?: number;
};

type AuthProvider = 'phone' | 'email' | 'google' | 'apple';
type AuthSession = {
  user: MobileUser;
  token?: string | null;
  provider: AuthProvider;
  is_new_user?: boolean;
};

type BookingPayload = {
  customer_id: number;
  service: string;
  vehicle: string;
  wash_type_key: 'exterior' | 'interior' | 'complete';
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  scheduled_at?: string;
  notes?: string;
};

const normalizeMobileUser = (user: MobileUser): MobileUser => ({
  ...user,
  avatar_url: absolutizeMediaUrl(user.avatar_url),
});

const normalizeAuthSession = (
  raw: any,
  provider: AuthProvider
): AuthSession => {
  const user = normalizeMobileUser(raw?.user || raw);
  const token =
    raw?.token ||
    raw?.access_token ||
    raw?.auth_token ||
    null;

  return {
    user,
    token,
    provider,
    is_new_user: Boolean(raw?.is_new_user),
  };
};

const normalizeBooking = (booking: any) => {
  if (!booking || typeof booking !== 'object') return booking;

  const driver = booking.driver && typeof booking.driver === 'object'
    ? { ...booking.driver, avatar_url: absolutizeMediaUrl(booking.driver.avatar_url) }
    : booking.driver;

  const beforePhotos = Array.isArray(booking.before_photos)
    ? booking.before_photos.map((url: string) => absolutizeMediaUrl(url) || '').filter(Boolean)
    : booking.before_photos;

  const afterPhotos = Array.isArray(booking.after_photos)
    ? booking.after_photos.map((url: string) => absolutizeMediaUrl(url) || '').filter(Boolean)
    : booking.after_photos;

  return {
    ...booking,
    driver,
    before_photos: beforePhotos,
    after_photos: afterPhotos,
  };
};

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers || {}),
    },
    ...init,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data?.message || `Erreur API (${response.status})`, response.status, data);
  }

  return data as T;
}

export async function healthCheck() {
  return apiRequest<{ ok: boolean }>('/health');
}

export async function mobileLogin(payload: {
  phone: string;
  role: 'customer' | 'driver';
  name?: string;
}) {
  const response = await apiRequest<{ user: MobileUser }>('/auth/mobile-login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { ...response, user: normalizeMobileUser(response.user) };
}

export async function requestPhoneOtp(payload: { phone: string; country_code: string }) {
  return apiRequest<{ success: boolean; message?: string; ttl?: number }>('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyPhoneOtp(payload: {
  phone: string;
  country_code: string;
  code: string;
  role?: 'customer' | 'driver';
  name?: string;
}) {
  const response = await apiRequest<any>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeAuthSession(response, 'phone');
}

export async function registerWithEmail(payload: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: 'customer' | 'driver';
}) {
  const response = await apiRequest<any>('/auth/email/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeAuthSession(response, 'email');
}

export async function loginWithEmail(payload: {
  email: string;
  password: string;
  role?: 'customer' | 'driver';
}) {
  const response = await apiRequest<any>('/auth/email/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeAuthSession(response, 'email');
}

export function buildOAuthStartUrl(provider: 'google' | 'apple', redirectUri: string, state: string) {
  const params = new URLSearchParams({
    provider,
    redirect_uri: redirectUri,
    state,
    platform: 'mobile',
    role: 'customer',
  });
  return `${API_BASE_URL}/auth/oauth/start?${params.toString()}`;
}

export async function completeOAuth(payload: {
  provider: 'google' | 'apple';
  code?: string | null;
  id_token?: string | null;
  access_token?: string | null;
  redirect_uri: string;
  state?: string | null;
}) {
  const response = await apiRequest<any>('/auth/oauth/mobile-complete', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeAuthSession(response, payload.provider);
}

export async function createBooking(payload: BookingPayload) {
  const response = await apiRequest<{ booking: any; customer_wallet_balance: number }>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { ...response, booking: normalizeBooking(response.booking) };
}

export async function getCustomerBookings(customerId: number) {
  const response = await apiRequest<{ bookings: any[] }>(`/customers/${customerId}/bookings`);
  return { ...response, bookings: response.bookings.map((item) => normalizeBooking(item)) };
}

export async function cancelBooking(
  bookingId: string | number,
  payload: { customer_id: number; reason?: string }
) {
  const response = await apiRequest<{ booking: any }>(`/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({
      customer_id: payload.customer_id,
      reason: payload.reason || 'cancelled_from_app',
    }),
  });
  return { ...response, booking: normalizeBooking(response.booking) };
}

export async function getBooking(bookingId: string | number) {
  const response = await apiRequest<{ booking: any }>(`/bookings/${bookingId}`);
  return { ...response, booking: normalizeBooking(response.booking) };
}

export async function rateBooking(
  bookingId: string | number,
  payload: { customer_id: number; rating: number; review?: string }
) {
  const response = await apiRequest<{ booking: any }>(`/bookings/${bookingId}/rate`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return { ...response, booking: normalizeBooking(response.booking) };
}

export async function getUserProfile(userId: number) {
  const response = await apiRequest<{ user: MobileUser; stats: Record<string, number> }>(`/users/${userId}/profile`);
  return { ...response, user: normalizeMobileUser(response.user) };
}

export async function updateUserProfile(
  userId: number,
  payload: Partial<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    bio: string;
    avatar_url: string;
  }>
) {
  const response = await apiRequest<{ user: MobileUser; stats: Record<string, number> }>(`/users/${userId}/profile`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return { ...response, user: normalizeMobileUser(response.user) };
}

export async function uploadUserAvatar(userId: number, uri: string) {
  const form = new FormData();
  form.append('avatar', {
    uri,
    name: `avatar-${Date.now()}.jpg`,
    type: 'image/jpeg',
  } as any);

  const response = await apiRequest<{ user: MobileUser; stats: Record<string, number> }>(`/users/${userId}/avatar`, {
    method: 'POST',
    body: form,
  });
  return { ...response, user: normalizeMobileUser(response.user) };
}

export { API_BASE_URL, API_ORIGIN };
