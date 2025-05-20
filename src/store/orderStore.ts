// src/store/orderStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProductVariant } from '@/types/menu'; // Asegúrate de que esta ruta sea correcta

// Define el estado del carrito
interface CartItem {
  variant: ProductVariant;
  quantity: number;
}

interface OrderState {
  cartItems: CartItem[];
  tableNumber: string; // Para el número de mesa
  notes: string; // Notas generales del pedido
  addToCart: (variant: ProductVariant, quantity: number) => void;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, delta: number) => void;
  setTableNumber: (tableNumber: string) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      tableNumber: '', // Estado inicial
      notes: '',     // Estado inicial

      addToCart: (variant, quantity) => {
        set((state) => {
          const existingItemIndex = state.cartItems.findIndex(
            (item) => item.variant.variant_id === variant.variant_id
          );

          if (existingItemIndex > -1) {
            // Actualizar cantidad si el ítem ya existe
            const newCartItems = [...state.cartItems];
            newCartItems[existingItemIndex].quantity += quantity;
            // Asegurarse de que la cantidad no sea negativa
            if (newCartItems[existingItemIndex].quantity <= 0) {
              newCartItems.splice(existingItemIndex, 1); // Eliminar si la cantidad es 0 o menos
            }
            return { cartItems: newCartItems };
          } else {
            // Añadir nuevo ítem si la cantidad es positiva
            if (quantity > 0) {
              return { cartItems: [...state.cartItems, { variant, quantity }] };
            }
            return state; // No añadir si la cantidad es 0 o menos
          }
        });
      },

      removeFromCart: (variantId) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.variant.variant_id !== variantId),
        }));
      },

      updateQuantity: (variantId, delta) => {
        set((state) => {
          const newCartItems = state.cartItems
            .map((item) => {
              if (item.variant.variant_id === variantId) {
                return { ...item, quantity: item.quantity + delta };
              }
              return item;
            })
            .filter((item) => item.quantity > 0); // Eliminar ítems con cantidad <= 0
          return { cartItems: newCartItems };
        });
      },

      setTableNumber: (tableNumber) => set({ tableNumber }),
      setNotes: (notes) => set({ notes }),
      clearCart: () => set({ cartItems: [], tableNumber: '', notes: '' }),

      getCartTotal: () => {
        return get().cartItems.reduce(
          (total, item) => total + item.variant.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'client-order-storage', // Nombre para el localStorage
      storage: createJSONStorage(() => localStorage), // (opcional) usa localStorage
    }
  )
);
