// src/hooks/useActivityTracker.ts
import { useEffect, useCallback } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useTranslation } from '@/hooks/useTranslation'

interface ActivityTrackerOptions {
  warningMinutes?: number
  logoutMinutes?: number
  enabled?: boolean
}

export function useActivityTracker(options: ActivityTrackerOptions = {}) {
  const { data: session } = useSession()
  const { t } = useTranslation('es') // Default to Spanish

  const {
    warningMinutes = 30, // ✅ Más conservador: advertir a los 30 min
    logoutMinutes = 35,  // ✅ Logout a los 35 min
    enabled = true
  } = options

  const handleLogout = useCallback(() => {
    signOut({
      callbackUrl: '/es/login?reason=inactivity',
      redirect: true
    })
  }, [])

  const showWarning = useCallback(() => {
    const timeLeft = logoutMinutes - warningMinutes
    const message = t?.establishmentAdmin?.security?.sessionWarning ||
      `Tu sesión expirará en ${timeLeft} minutos. ¿Continuar?`

    // ✅ Modal más profesional en lugar de confirm()
    const shouldContinue = confirm(message)
    if (!shouldContinue) {
      handleLogout()
    }
  }, [logoutMinutes, warningMinutes, handleLogout, t])

  useEffect(() => {
    if (!enabled || !session) return

    let warningTimer: NodeJS.Timeout
    let logoutTimer: NodeJS.Timeout

    const resetTimers = () => {
      clearTimeout(warningTimer)
      clearTimeout(logoutTimer)

      // ✅ Warning más temprano (30 min)
      warningTimer = setTimeout(showWarning, warningMinutes * 60 * 1000)

      // ✅ Logout más temprano (35 min)
      logoutTimer = setTimeout(handleLogout, logoutMinutes * 60 * 1000)
    }

    // ✅ Eventos que resetean el timer (incluye más eventos)
    const events = [
      'mousedown', 'mousemove', 'keydown', 'keypress',
      'scroll', 'touchstart', 'click', 'focus'
    ]

    const throttledReset = throttle(resetTimers, 1000) // ✅ Throttle para performance

    events.forEach(event =>
      document.addEventListener(event, throttledReset, { passive: true })
    )

    resetTimers() // Inicializar

    return () => {
      events.forEach(event =>
        document.removeEventListener(event, throttledReset)
      )
      clearTimeout(warningTimer)
      clearTimeout(logoutTimer)
    }
  }, [enabled, session, warningMinutes, logoutMinutes, showWarning, handleLogout])

  return {
    enabled,
    warningMinutes,
    logoutMinutes,
    forceLogout: handleLogout
  }
}

// ✅ Utility: Throttle function to prevent excessive timer resets
function throttle(func: Function, limit: number) {
  let inThrottle: boolean
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
