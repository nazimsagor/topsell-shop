import { create } from 'zustand';
import { cartApi } from '../lib/api';

const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  loading: false,
  isCartOpen: false,

  openCart:  () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await cartApi.get();
      set({ items: data.items || [], subtotal: data.subtotal || 0, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (product_id, qty = 1) => {
    await cartApi.addItem({ product_id, qty });
    await get().fetchCart();
  },

  updateItem: async (id, qty) => {
    await cartApi.updateItem(id, { qty });
    await get().fetchCart();
  },

  removeItem: async (id) => {
    await cartApi.removeItem(id);
    await get().fetchCart();
  },

  clearCart: async () => {
    await cartApi.clear();
    set({ items: [], subtotal: 0 });
  },

  get count() {
    return get().items.reduce((sum, item) => sum + (item.qty || 0), 0);
  },
}));

export default useCartStore;
