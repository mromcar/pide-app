import { z } from 'zod';

export const establishmentIdSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
});

export const establishmentCreateSchema = z.object({
  name: z.string().min(1).max(255),
  tax_id: z.string().max(20).optional().nullable(),
  address: z.string().optional().nullable(),
  postal_code: z.string().max(10).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  phone1: z.string().max(20).optional().nullable(),
  phone2: z.string().max(20).optional().nullable(),
  billing_bank_details: z.string().optional().nullable(),
  payment_bank_details: z.string().optional().nullable(),
  contact_person: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().url().max(255).optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  accepts_orders: z.boolean().optional(), // Default is true in schema
});

export const establishmentUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  tax_id: z.string().max(20).optional().nullable(),
  address: z.string().optional().nullable(),
  postal_code: z.string().max(10).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  phone1: z.string().max(20).optional().nullable(),
  phone2: z.string().max(20).optional().nullable(),
  billing_bank_details: z.string().optional().nullable(),
  payment_bank_details: z.string().optional().nullable(),
  contact_person: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().url().max(255).optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  accepts_orders: z.boolean().optional(),
});

export type EstablishmentCreateInput = z.infer<typeof establishmentCreateSchema>;
export type EstablishmentUpdateInput = z.infer<typeof establishmentUpdateSchema>;