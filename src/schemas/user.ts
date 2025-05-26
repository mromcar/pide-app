// src/schemas/user.ts
import { z } from 'zod'
import { idSchema, } from './common'
import { UserRole } from '../types/enums'

export const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole),
  establishmentId: idSchema.optional().nullable(),
  isActive: z.boolean().default(true).optional(),
  // Otros campos según tu modelo
})

export const updateUserSchema = createUserSchema.partial().extend({
  password: z.string().min(6).optional(),
})

export const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
})
