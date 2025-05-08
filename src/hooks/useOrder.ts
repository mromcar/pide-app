import { useState, useCallback, useMemo } from 'react'
import type { OrderStatus } from '@/types/menu'

export function useOrder() {
  const [order, setOrder] = useState<{ [variantId: number]: number }>({})
  const [notes, setNotes] = useState('')

  const handleChange = useCallback((variantId: number, delta: number) => {
    setOrder((prev) => {
      const next = { ...prev, [variantId]: Math.max(0, (prev[variantId] || 0) + delta) }
      if (next[variantId] === 0) delete next[variantId]
      return next
    })
  }, [])

  return {
    order,
    notes,
    setNotes,
    handleChange,
  }
}
