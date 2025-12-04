import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
  stock: number;
  category: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, unit: string) => void;
  updateQuantity: (productId: string, unit: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          // Check if item with same productId AND unit already exists
          const existingItem = state.items.find(
            (i) => i.productId === item.productId && i.unit === item.unit
          );

          if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            
            if (newQuantity > item.stock) {
              return state;
            }
            
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.unit === item.unit
                  ? { ...i, quantity: newQuantity }
                  : i
              ),
            };
          }

          // New item (different product or different unit), add to cart
          return {
            items: [...state.items, item],
          };
        }),

      removeItem: (productId, unit) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.unit === unit)
          ),
        })),

      updateQuantity: (productId, unit, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return {
              items: state.items.filter(
                (i) => !(i.productId === productId && i.unit === unit)
              ),
            };
          }

          return {
            items: state.items.map((i) =>
              i.productId === productId && i.unit === unit 
                ? { ...i, quantity } 
                : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage', // LocalStorage key
    }
  )
);
