import { create } from 'zustand';

interface UserData {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  selectedLocation: string;
  selectedVehicle: 'Berline' | 'Compacte' | 'SUV';
  selectedWashType: 'exterior' | 'interior' | 'complete';
  walletBalance: number;
}

interface UserStore extends UserData {
  updateUserData: (key: keyof UserData, value: any) => void;
  resetUserData: () => void;
}

const initialState: UserData = {
  phone: '',
  firstName: '',
  lastName: '',
  email: '',
  selectedLocation: 'Riviera 2 - Carrefour Duncan',
  selectedVehicle: 'Berline',
  selectedWashType: 'exterior',
  walletBalance: 3000,
};

export const useUserStore = create<UserStore>((set) => ({
  ...initialState,
  updateUserData: (key, value) =>
    set((state) => ({ ...state, [key]: value })),
  resetUserData: () => set(initialState),
}));