'use client'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'
interface Toast {
  id: number
  type: ToastType
  message: string
}
interface ToastContextValue {
  success: (msg: string, ms?: number) => void
  error: (msg: string, ms?: number) => void
  info: (msg: string, ms?: number) => void
}
const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((type: ToastType, message: string, ms = 2500) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, type, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms)
  }, [])

  const api = useMemo<ToastContextValue>(
    () => ({
      success: (m, ms) => push('success', m, ms),
      error: (m, ms) => push('error', m, ms),
      info: (m, ms) => push('info', m, ms),
    }),
    [push]
  )

  useEffect(() => {
    ;(globalThis as any).toast = api
    return () => {
      if ((globalThis as any).toast === api) (globalThis as any).toast = undefined
    }
  }, [api])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[1000] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-md border px-3 py-2 text-sm shadow ${
              t.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : t.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-neutral-200 bg-white text-neutral-800'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
