import { ZodIssue } from 'zod';

export function jsonOk(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status });
}

export function jsonError(message: string | ZodIssue[], status = 400) {
  const errorBody = typeof message === 'string' ? { error: message } : { errors: message };
  return new Response(JSON.stringify(errorBody), { status });
}
