import { z } from 'zod';

// Validación para IDs positivos
export const idSchema = z.number().int().positive();

// Validación para campos de nombre genéricos
export const nameSchema = z.string().min(1).max(255);

// Validación para descripciones opcionales
export const descriptionSchema = z.string().max(65535).optional().nullable()
  .transform(val => val === undefined ? null : val);

// Validación para URLs opcionales
export const urlSchema = z.string().url().optional().nullable()
  .transform(val => val === undefined ? null : val);

// Validación para booleanos opcionales
export const optionalBooleanSchema = z.boolean().optional().nullable();
