import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { subscribeCustomerBookingRealtime } from '@/lib/realtime';
import { useUserStore } from '@/hooks/useUserData';

export const useCustomerRealtime = () => {
  const backendCustomerId = useUserStore((state) => state.backendCustomerId);
  const updateActivityStatus = useUserStore((state) => state.updateActivityStatus);
  const touchRealtime = useUserStore((state) => state.touchRealtime);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      setAppState(next);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!backendCustomerId) return;
    if (appState !== 'active') return;

    const unsubscribe = subscribeCustomerBookingRealtime(backendCustomerId, (payload) => {
      const bookingId = String(payload?.id || '');
      if (!bookingId) return;
      if (payload?.status) {
        updateActivityStatus(bookingId, String(payload.status));
      }
      touchRealtime();
    });

    return () => unsubscribe();
  }, [appState, backendCustomerId, touchRealtime, updateActivityStatus]);
};
