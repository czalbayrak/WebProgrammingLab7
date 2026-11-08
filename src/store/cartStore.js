import { create } from "zustand";

const STORAGE_KEY = "cart-items";

// Initialise the store from localStorage.
function loadItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// State: only `items`. Item count and total price are DERIVED, never stored.
export const useCartStore = create((set) => ({
  items: loadItems(),

  addItem: (product) =>
    set((state) => {
      const exists = state.items.some((item) => item.id === product.id);
      if (exists) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { id: product.id, title: product.title, price: product.price, quantity: 1 },
        ],
      };
    }),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

  setQuantity: (id, quantity) =>
    set((state) => {
      if (quantity < 1) {
        return { items: state.items.filter((item) => item.id !== id) };
      }
      return {
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }),

  clear: () => set({ items: [] }),
}));

// Persistence from OUTSIDE React, using the store's subscription mechanism.
// Runs on every store change; we only write when the items array changed.
useCartStore.subscribe((state, prevState) => {
  if (state.items !== prevState.items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore storage errors
    }
  }
});

// Selectors (return primitives or existing references).
export const selectItems = (state) => state.items;
export const selectItemCount = (state) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectTotalPrice = (state) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const selectAddItem = (state) => state.addItem;
export const selectRemoveItem = (state) => state.removeItem;
export const selectSetQuantity = (state) => state.setQuantity;
export const selectClear = (state) => state.clear;
