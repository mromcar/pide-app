import { z } from 'zod';
import { UserRole } from '@prisma/client'; // Make sure this enum is available

export const userIdSchema = z.object({
  user_id: z.number().int().positive(),
});

export const userCreateSchema = z.object({
  role: z.nativeEnum(UserRole),
  name: z.string().min(1).max(255).nullable().optional(),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'), // Add more password complexity rules if needed
  establishment_id: z.number().int().positive().nullable().optional(),
});

export const userUpdateSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  name: z.string().min(1).max(255).nullable().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
  establishment_id: z.number().int().positive().nullable().optional(),
  is_active: z.boolean().optional(), // If you add is_active to User model
});

export const userResponseSchema = z.object({
  user_id: z.number().int().positive(),
  role: z.nativeEnum(UserRole),
  name: z.string().nullable(),
  email: z.string().email(),
  establishment_id: z.number().int().positive().nullable(),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  // establishment: establishmentResponseSchema.nullable().optional(), // Example
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});