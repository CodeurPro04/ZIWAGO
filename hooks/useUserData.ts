import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserData {
  onboardingCompleted: boolean;
  isAuthenticated: boolean;
  authProvider: 'phone' | 'email' | 'google' | 'apple' | null;
  authToken: string | null;
  biometricEnabled: boolean;
  backendCustomerId: number | null;
  countryCode: string;
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  selectedLocation: string;
  selectedLocationCoords: { latitude: number; longitude: number } | null;
  selectedVehicle: 'Berline' | 'Compacte' | 'SUV';
  selectedWashType: 'exterior' | 'interior' | 'complete';
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  activities: ActivityItem[];
  realtimeVersion: number;
}

interface UserStore extends UserData {
  updateUserData: (key: keyof UserData, value: any) => void;
  resetUserData: () => void;
  setOnboardingCompleted: (value: boolean) => void;
  addActivity: (activity: ActivityItem) => void;
  updateActivityStatus: (id: string, bookingStatus: string) => void;
  updateActivityRating: (id: string, rating: number) => void;
  addWalletTransaction: (transaction: WalletTransaction) => void;
  replaceActivities: (activities: ActivityItem[]) => void;
  touchRealtime: () => void;
}

type ActivityStatus = 'completed' | 'pending' | 'cancelled';

export interface ActivityItem {
  id: string;
  status: ActivityStatus;
  bookingStatus?: string;
  title: string;
  vehicle: string;
  washer: string;
  date: string;
  price: number;
  rating?: number | null;
}

export type WalletTransaction = {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  date: string;
  amount: number;
};

const toUiActivityStatus = (bookingStatus?: string): ActivityStatus => {
  if (bookingStatus === 'completed') return 'completed';
  if (bookingStatus === 'cancelled') return 'cancelled';
  return 'pending';
};

const initialState: UserData = {
  onboardingCompleted: false,
  isAuthenticated: false,
  authProvider: null,
  authToken: null,
  biometricEnabled: false,
  backendCustomerId: null,
  countryCode: '+225',
  phone: '',
  firstName: '',
  lastName: '',
  email: '',
  avatarUrl: '',
  selectedLocation: 'Riviera 2 - Carrefour Duncan',
  selectedLocationCoords: null,
  selectedVehicle: 'Berline',
  selectedWashType: 'exterior',
  walletBalance: 3000,
  walletTransactions: [
    {
      id: 't1',
      type: 'credit',
      title: 'Recharge Orange Money',
      date: "Aujourd'hui, 14:30",
      amount: 5000,
    },
    {
      id: 't2',
      type: 'debit',
      title: 'Lavage voiture - Renault Clio',
      date: 'Hier, 10:15',
      amount: 2500,
    },
    {
      id: 't3',
      type: 'credit',
      title: 'Recharge MTN Money',
      date: '15 mars, 09:45',
      amount: 10000,
    },
    {
      id: 't4',
      type: 'debit',
      title: 'Nettoyage intérieur',
      date: '12 mars, 16:20',
      amount: 3500,
    },
  ],
  activities: [
    {
      id: 'seed-1',
      status: 'completed',
      title: 'Lavage complet',
      vehicle: 'Compacte',
      washer: 'Jean D.',
      date: "Aujourd'hui",
      price: 4500,
      rating: 5,
    },
    {
      id: 'seed-2',
      status: 'pending',
      title: 'Lavage programme',
      vehicle: 'SUV',
      washer: 'Marie L.',
      date: 'Demain, 10:00',
      price: 5200,
      rating: null,
    },
  ],
  realtimeVersion: 0,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,
      updateUserData: (key, value) =>
        set((state) => ({ ...state, [key]: value })),
      setOnboardingCompleted: (value) =>
        set((state) => ({ ...state, onboardingCompleted: value })),
      resetUserData: () =>
        set((state) => ({
          ...initialState,
          onboardingCompleted: state.onboardingCompleted,
        })),
      addActivity: (activity) =>
        set((state) => ({
          ...state,
          activities: [activity, ...state.activities],
        })),
      updateActivityStatus: (id, bookingStatus) =>
        set((state) => ({
          ...state,
          activities: state.activities.map((item) =>
            item.id === id
              ? { ...item, bookingStatus, status: toUiActivityStatus(bookingStatus) }
              : item
          ),
        })),
      updateActivityRating: (id, rating) =>
        set((state) => ({
          ...state,
          activities: state.activities.map((item) =>
            item.id === id ? { ...item, rating } : item
          ),
        })),
      addWalletTransaction: (transaction) =>
        set((state) => ({
          ...state,
          walletTransactions: [transaction, ...state.walletTransactions],
        })),
      replaceActivities: (activities) =>
        set((state) => ({
          ...state,
          activities,
        })),
      touchRealtime: () =>
        set((state) => ({
          ...state,
          realtimeVersion: state.realtimeVersion + 1,
        })),
    }),
    {
      name: 'ZIWAGO_CLIENT_STATE_V1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
