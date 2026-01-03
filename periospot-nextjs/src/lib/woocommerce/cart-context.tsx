"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import type { CartItem, Cart } from "./types"

// Cart Actions
type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

// Cart State
interface CartState {
  items: CartItem[]
  isLoading: boolean
}

// Cart Context Type
interface CartContextType {
  cart: Cart
  items: CartItem[]
  itemCount: number
  isLoading: boolean
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getCheckoutUrl: () => Promise<string | null>
  isInCart: (productId: number) => boolean
}

const CartContext = createContext<CartContextType | null>(null)

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId
      )
      if (existingIndex >= 0) {
        const newItems = [...state.items]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.payload.quantity,
        }
        return { ...state, items: newItems }
      }
      return { ...state, items: [...state.items, action.payload] }
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      }
    case "CLEAR_CART":
      return { ...state, items: [] }
    case "LOAD_CART":
      return { ...state, items: action.payload, isLoading: false }
    default:
      return state
  }
}

// Local Storage Key
const CART_STORAGE_KEY = "periospot_cart"

// Provider Component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: true,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const items = JSON.parse(stored) as CartItem[]
        dispatch({ type: "LOAD_CART", payload: items })
      } else {
        dispatch({ type: "LOAD_CART", payload: [] })
      }
    } catch {
      dispatch({ type: "LOAD_CART", payload: [] })
    }
  }, [])

  // Save cart to localStorage when items change
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
    }
  }, [state.items, state.isLoading])

  // Calculate cart totals
  const cart: Cart = {
    items: state.items,
    subtotal: state.items.reduce(
      (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
      0
    ),
    total: state.items.reduce(
      (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
      0
    ),
    currency: "EUR",
  }

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    const id = `${item.productId}-${Date.now()}`
    dispatch({ type: "ADD_ITEM", payload: { ...item, id } })
  }, [])

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" })
  }, [])

  const isInCart = useCallback(
    (productId: number) => {
      return state.items.some((item) => item.productId === productId)
    },
    [state.items]
  )

  const getCheckoutUrl = useCallback(async (): Promise<string | null> => {
    if (state.items.length === 0) return null

    try {
      const response = await fetch("/api/woocommerce/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: state.items }),
      })

      const data = await response.json()
      if (data.success && data.checkoutUrl) {
        return data.checkoutUrl
      }
      return null
    } catch (error) {
      console.error("Failed to get checkout URL:", error)
      return null
    }
  }, [state.items])

  return (
    <CartContext.Provider
      value={{
        cart,
        items: state.items,
        itemCount,
        isLoading: state.isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getCheckoutUrl,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook to use cart
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
