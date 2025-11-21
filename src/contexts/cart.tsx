'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

const CART_STORAGE_KEY = 'ebs-cart-v1'

export type CartItemType = 'promo' | 'manufacturado' | 'insumo'

export interface CartItem {
  type: CartItemType
  id: number
  title: string
  unitPrice: number
  imageUrl: string | null
  quantity: number
}

interface CartState {
  sucursalId: number | null
  items: CartItem[]
}

const initialState: CartState = {
  sucursalId: null,
  items: [],
}

type AddItemPayload = {
  sucursalId: number
  item: Omit<CartItem, 'quantity'>
  quantity?: number
}

type CartAction =
  | {type: 'HYDRATE'; payload: CartState}
  | {type: 'ADD_ITEM'; payload: AddItemPayload}
  | {type: 'SET_ITEM_QUANTITY'; payload: {type: CartItemType; id: number; quantity: number}}
  | {type: 'REMOVE_ITEM'; payload: {type: CartItemType; id: number}}
  | {type: 'CLEAR'}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE': {
      const next = action.payload
      if (!next || typeof next !== 'object') return state
      return {
        sucursalId: typeof next.sucursalId === 'number' ? next.sucursalId : initialState.sucursalId,
        items: Array.isArray(next.items) ? next.items : initialState.items,
      }
    }

    case 'ADD_ITEM': {
      const {sucursalId, item, quantity = 1} = action.payload
      if (quantity <= 0) return state

      let base: CartState = state

      // If we already have items from another sucursal, reset for the new one.
      if (state.sucursalId !== null && state.sucursalId !== sucursalId && state.items.length > 0) {
        base = {sucursalId, items: []}
      } else if (state.sucursalId === null) {
        base = {...state, sucursalId}
      }

      const existingIndex = base.items.findIndex(it => it.type === item.type && it.id === item.id)

      if (existingIndex >= 0) {
        const items = base.items.map((it, idx) =>
          idx === existingIndex ? {...it, quantity: it.quantity + quantity} : it
        )
        return {...base, items}
      }

      return {
        ...base,
        items: [...base.items, {...item, quantity}],
      }
    }

    case 'SET_ITEM_QUANTITY': {
      const {type, id, quantity} = action.payload
      if (quantity <= 0) {
        const items = state.items.filter(it => !(it.type === type && it.id === id))
        return {...state, items}
      }
      const items = state.items.map(it =>
        it.type === type && it.id === id ? {...it, quantity} : it
      )
      return {...state, items}
    }

    case 'REMOVE_ITEM': {
      const {type, id} = action.payload
      const items = state.items.filter(it => !(it.type === type && it.id === id))
      return {...state, items}
    }

    case 'CLEAR': {
      // We can keep sucursalId or reset it; keeping it is slightly nicer UX.
      return {...state, items: []}
    }

    default:
      return state
  }
}

function loadFromStorage(): CartState {
  if (typeof window === 'undefined') return initialState
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return initialState
    return {
      sucursalId:
        typeof parsed.sucursalId === 'number' ? parsed.sucursalId : initialState.sucursalId,
      items: Array.isArray(parsed.items) ? parsed.items : initialState.items,
    }
  } catch {
    return initialState
  }
}

interface CartContextValue extends CartState {
  totalQuantity: number
  totalAmount: number
  addItem: (payload: AddItemPayload) => void
  setItemQuantity: (type: CartItemType, id: number, quantity: number) => void
  removeItem: (type: CartItemType, id: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    return loadFromStorage()
  })

  // Persist to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  const addItem = useCallback(
    (payload: AddItemPayload) => {
      dispatch({type: 'ADD_ITEM', payload})
    },
    [dispatch]
  )

  const setItemQuantity = useCallback(
    (type: CartItemType, id: number, quantity: number) => {
      dispatch({type: 'SET_ITEM_QUANTITY', payload: {type, id, quantity}})
    },
    [dispatch]
  )

  const removeItem = useCallback(
    (type: CartItemType, id: number) => {
      dispatch({type: 'REMOVE_ITEM', payload: {type, id}})
    },
    [dispatch]
  )

  const clear = useCallback(() => {
    dispatch({type: 'CLEAR'})
  }, [dispatch])

  const value: CartContextValue = useMemo(() => {
    const totalQuantity = state.items.reduce((acc, it) => acc + it.quantity, 0)
    const totalAmount = state.items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0)
    return {
      ...state,
      totalQuantity,
      totalAmount,
      addItem,
      setItemQuantity,
      removeItem,
      clear,
    }
  }, [state, addItem, setItemQuantity, removeItem, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
