// stores/useCartStore.ts
import { create } from 'zustand';

type Tool = {
  id: string;
  name: string;
  description: string;
  iconUrl?: string | null;
  authProvider: string;
  authRequired: boolean;
};

type CartState = {
  cart: Tool[];
  addToCart: (tool: Tool) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  addToCart: (tool) =>
    set((state) => ({
      cart: state.cart.some((t) => t.id === tool.id)
        ? state.cart
        : [...state.cart, tool],
    })),
  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((t) => t.id !== id),
    })),
  clearCart: () => set({ cart: [] }),
}));
