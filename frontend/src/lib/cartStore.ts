import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string; // The Inventory ID or Pan ID (need to check)
  panId: string;
  lot: string;
  grade: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
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
            return; // Already added, do nothing (or update qty)
        }
        set({ items: [...currentItems, newItem] });
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