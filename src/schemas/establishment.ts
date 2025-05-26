// src/schemas/establishment.ts
import { z } from 'zod'
import { optionalString, optionalUrl } from './common'

export const createEstablishmentSchema = z.object({
  name: z.string().min(1).max(255),
  taxId: optionalString,
  address: optionalString,
  postalCode: optionalString,
  city: optionalString,
  phone1: optionalString,
  phone2: optionalString,
  billingBankDetails: optionalString,
  paymentBankDetails: optionalString,
  contactPerson: optionalString,
  description: optionalString,
  website: optionalUrl,
  isActive: z.boolean().default(true).optional(),
  acceptsOrders: z.boolean().default(true).optional(),
})

export const updateEstablishmentSchema = createEstablishmentSchema.partial()

export const establishmentIdParamSchema = z.object({
  establishmentId: z.coerce.number().int().positive(),
})

// ... otros schemas de establishment
