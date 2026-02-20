import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string; // React-side unique ID
  panId: string;
  polymer?: string;
  form?: string;
  folder?: string;
  lotName?: string;
  lot: string; // The lot number as string for display
  grade: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => boolean;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const currentItems = get().items;
        // Check if already in cart
        if (currentItems.find(i => i.id === newItem.id)) {
          return false; // Already added
        }

        if (currentItems.length >= 4) {
          import('sonner').then(({ toast }) => toast.error("Comparison cart is full (Max 4 items)"));
          return false;
        }

        set({ items: [...currentItems, newItem] });
        return true;
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'sunrise-cart-storage', // unique name in LocalStorage
      storage: createJSONStorage(() => localStorage), // Save to browser
    }
  )
);