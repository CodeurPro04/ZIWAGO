import { create } from 'zustand';

interface UserData {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  selectedLocation: string;
  selectedLocationCoords: { latitude: number; longitude: number } | null;
  selectedVehicle: 'Berline' | 'Compacte' | 'SUV';
  selectedWashType: 'exterior' | 'interior' | 'complete';
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  activities: ActivityItem[];
}

interface UserStore extends UserData {
  updateUserData: (key: keyof UserData, value: any) => void;
  resetUserData: () => void;
  addActivity: (activity: ActivityItem) => void;
  updateActivityStatus: (id: string, status: ActivityItem['status']) => void;
  addWalletTransaction: (transaction: WalletTransaction) => void;
}

type ActivityStatus = 'completed' | 'pending' | 'cancelled';

export interface ActivityItem {
  id: string;
  status: ActivityStatus;
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

const initialState: UserData = {
  phone: '',
  firstName: '',
  lastName: '',
  email: '',
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
      date: "Aujourd'hui, 14:30",
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
};

export const useUserStore = create<UserStore>((set) => ({
  ...initialState,
  updateUserData: (key, value) =>
    set((state) => ({ ...state, [key]: value })),
  resetUserData: () => set(initialState),
  addActivity: (activity) =>
    set((state) => ({
      ...state,
      activities: [activity, ...state.activities],
    })),
  updateActivityStatus: (id, status) =>
    set((state) => ({
      ...state,
      activities: state.activities.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    })),
  addWalletTransaction: (transaction) =>
    set((state) => ({
      ...state,
      walletTransactions: [transaction, ...state.walletTransactions],
    })),
}));
