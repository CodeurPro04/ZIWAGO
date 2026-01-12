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
  activities: ActivityItem[];
}

interface UserStore extends UserData {
  updateUserData: (key: keyof UserData, value: any) => void;
  resetUserData: () => void;
  addActivity: (activity: ActivityItem) => void;
  updateActivityStatus: (id: string, status: ActivityItem['status']) => void;
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
}));
