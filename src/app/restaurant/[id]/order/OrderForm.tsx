// src/components/order/OrderForm.tsx
'use client'

import React, { useState } from 'react'
import { useOrderStore } from '@/store/orderStore' // O la ruta a tu store (Zustand, etc.)
import { createClientOrder } from '@/services/orderServices' // Función para crear el pedido en el backend
import { CreateOrderDTO } from '@/types/dtos' // Tu DTO para el pedido

type OrderFormProps = {
  establishmentId: number // El ID del establecimiento para asociar el pedido
}

export function OrderForm({ establishmentId }: OrderFormProps) {
  // Asegúrate de que useOrderStore te proporcione estos ítems y la función clearCart
  const cartItems = useOrderStore((state) => state.cartItems)
  const getCartTotal = useOrderStore((state) => state.getCartTotal)
  const clearCart = useOrderStore((state) => state.clearCart)

  const [tableNumber, setTableNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('') // Opciones: 'EFECTIVO', 'TARJETA', etc.
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null)
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null)
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null) // Si el backend devuelve el ID
  // Si tu backend devuelve un token único para que el cliente sin cuenta vea su pedido:
  // const [orderTrackingToken, setOrderTrackingToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      setSubmissionStatus('error')
      setSubmissionMessage(
        'Tu carrito está vacío. Por favor, añade productos antes de enviar el pedido.'
      )
      return
    }

    setIsSubmitting(true)
    setSubmissionStatus(null)
    setSubmissionMessage(null)
    setCreatedOrderId(null)
    // setOrderTrackingToken(null);

    try {
      const orderData: CreateOrderDTO = {
        establishment_id: establishmentId,
        table_number: tableNumber.trim() || null,
        // client_user_id: undefined, // Si el cliente no está logueado, no se envía este campo o es null
        payment_method: paymentMethod || null,
        order_type: 'MESA', // Puedes hacer que esto sea seleccionable por el usuario si tienes otros tipos
        notes: notes.trim() || null,
        items: cartItems.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          notes: item.notes || null, // Si tus items del carrito pueden tener notas individuales
        })),
      }

      // Aquí asumimos que createClientOrder devuelve el objeto de pedido completo creado
      const response = await createClientOrder(orderData)

      setSubmissionStatus('success')
      setSubmissionMessage('¡Pedido enviado con éxito! Te avisaremos cuando esté listo.')
      setCreatedOrderId(response.order_id)
      // Si tu backend devuelve un token para el seguimiento:
      // setOrderTrackingToken(response.order_tracking_token);
      clearCart() // Limpiar el carrito después del éxito
      setTableNumber('')
      setNotes('')
      setPaymentMethod('')
    } catch (error: any) {
      console.error('Error al enviar el pedido:', error)
      setSubmissionStatus('error')
      setSubmissionMessage(
        error.message || 'Error al enviar el pedido. Por favor, inténtalo de nuevo.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = getCartTotal()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Número de Mesa (opcional)
        </label>
        <input
          type="text"
          id="tableNumber"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="Ej: 5A"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notas para el pedido (opcional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Ej: Sin cebolla en la hamburguesa 🍔"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>

      <div className="mb-4">
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
          Método de Pago (opcional)
        </label>
        <select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-800"
        >
          <option value="">Selecciona método de pago</option>
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
          {/* Añade más opciones si tu sistema las soporta */}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || cartItems.length === 0}
        className="w-full bg-blue-600 hover:bg-700 text-white font-bold py-3 px-4 rounded-lg shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 text-lg"
      >
        {isSubmitting ? 'Enviando Pedido...' : `Enviar Pedido (${total.toFixed(2)} €)`}
      </button>

      {submissionStatus && (
        <div
          className={`mt-4 p-4 rounded-md text-center font-medium ${
            submissionStatus === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {submissionMessage}
          {createdOrderId && submissionStatus === 'success' && (
            <p className="mt-2 text-sm">
              Tu número de pedido es: <span className="font-bold">#{createdOrderId}</span>
              {/* Si tienes un token para seguimiento, lo mostrarías aquí y un enlace */}
              {/* {orderTrackingToken && (
                <Link href={`/restaurant/${establishmentId}/order/status/${orderTrackingToken}`} className="underline ml-1">
                  Ver estado
                </Link>
              )} */}
            </p>
          )}
        </div>
      )}
    </form>
  )
}
