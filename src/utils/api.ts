import { ZodIssue } from 'zod'

// Crear tipos específicos para respuestas
type ApiResponse<T = unknown> = T

export function jsonOk<T = unknown>(data: ApiResponse<T>, status = 200) {
  return new Response(JSON.stringify(data), { status })
}

export function jsonError(message: string | ZodIssue[], status = 400) {
  const errorBody = typeof message === 'string' ? { error: message } : { errors: message }
  return new Response(JSON.stringify(errorBody), { status })
}
