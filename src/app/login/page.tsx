'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  loginMainClasses,
  loginTitleClasses,
  loginFormClasses,
  loginInputClasses,
  loginBtnClasses,
  loginErrorClasses,
} from '@/utils/tailwind'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    if (res?.ok) {
      router.push('/empleado/pedidos')
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <main className={loginMainClasses}>
      <h1 className={loginTitleClasses}>Login empleados</h1>
      <form onSubmit={handleSubmit} className={loginFormClasses}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={loginInputClasses}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={loginInputClasses}
        />
        <button className={loginBtnClasses} type="submit">
          Entrar
        </button>
        {error && <div className={loginErrorClasses}>{error}</div>}
      </form>
    </main>
  )
}
