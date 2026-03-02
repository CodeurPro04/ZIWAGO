import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import { API_BASE_URL } from '@/lib/api';

type BookingRealtimePayload = {
  id?: number;
  status?: string;
  customer_id?: number;
  driver_id?: number | null;
};

let echoInstance: Echo<'pusher'> | null = null;

const resolveHostFromApi = () => {
  try {
    return new URL(API_BASE_URL).hostname;
  } catch {
    return '127.0.0.1';
  }
};

const wsEnabled = () => {
  const raw = (process.env.EXPO_PUBLIC_WS_ENABLED || 'true').toLowerCase();
  return !['0', 'false', 'off', 'no'].includes(raw);
};

const getEcho = () => {
  if (!wsEnabled()) return null;
  if (echoInstance) return echoInstance;

  const key = process.env.EXPO_PUBLIC_WS_KEY || process.env.EXPO_PUBLIC_PUSHER_APP_KEY || '';
  if (!key) return null;

  const host = process.env.EXPO_PUBLIC_WS_HOST || resolveHostFromApi();
  const port = Number(process.env.EXPO_PUBLIC_WS_PORT || 6001);
  const scheme = (process.env.EXPO_PUBLIC_WS_SCHEME || 'http').toLowerCase();
  const cluster = process.env.EXPO_PUBLIC_WS_CLUSTER || process.env.EXPO_PUBLIC_PUSHER_APP_CLUSTER || 'mt1';

  (globalThis as any).Pusher = Pusher;

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key,
    cluster,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
  });

  return echoInstance;
};

export const subscribeCustomerBookingRealtime = (
  customerId: number,
  onBookingUpdated: (payload: BookingRealtimePayload) => void
): (() => void) => {
  const echo = getEcho();
  if (!echo || !customerId) return () => undefined;

  const bookingsChannel = echo.channel('backoffice.bookings');
  const listener = (payload: BookingRealtimePayload) => {
    if (Number(payload?.customer_id) !== Number(customerId)) return;
    onBookingUpdated(payload);
  };

  bookingsChannel.listen('.booking.updated', listener);

  return () => {
    bookingsChannel.stopListening('.booking.updated');
    echo.leaveChannel('backoffice.bookings');
  };
};
