import { z } from 'zod';

export const establishmentIdSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
});

export const establishmentCreateSchema = z.object({
  name: z.string().min(1).max(255),
  taxId: z.string().max(20).optional().nullable(),
  address: z.string().optional().nullable(),
  postalCode: z.string().max(10).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  phone1: z.string().max(20).optional().nullable(),
  phone2: z.string().max(20).optional().nullable(),
  billingBankDetails: z.string().optional().nullable(),
  paymentBankDetails: z.string().optional().nullable(),
  contactPerson: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().url().max(255).optional().nullable(),
  isActive: z.boolean().optional().nullable(),
  acceptsOrders: z.boolean().optional(), // Default is true in schema
});

export const establishmentUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  taxId: z.string().max(20).optional().nullable(),
  address: z.string().optional().nullable(),
  postalCode: z.string().max(10).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  phone1: z.string().max(20).optional().nullable(),
  phone2: z.string().max(20).optional().nullable(),
  billingBankDetails: z.string().optional().nullable(),
  paymentBankDetails: z.string().optional().nullable(),
  contactPerson: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().url().max(255).optional().nullable(),
  isActive: z.boolean().optional().nullable(),
  acceptsOrders: z.boolean().optional(),
});

export type EstablishmentCreateInput = z.infer<typeof establishmentCreateSchema>;
export type EstablishmentUpdateInput = z.infer<typeof establishmentUpdateSchema>;
