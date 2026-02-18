import Constants from 'expo-constants';

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
    throw new Error(data?.message || `Erreur API (${response.status})`);
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

export async function cancelBooking(bookingId: string | number) {
  const response = await apiRequest<{ booking: any }>(`/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason: 'cancelled_from_app' }),
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

export { API_BASE_URL };
