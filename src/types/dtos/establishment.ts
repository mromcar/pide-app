// src/types/dtos/establishment.ts
import { z } from 'zod'
import {
  createEstablishmentSchema,
  updateEstablishmentSchema,
  establishmentIdParamSchema,
} from '../../schemas/establishment'

export type CreateEstablishmentDTO = z.infer<typeof createEstablishmentSchema>
export type UpdateEstablishmentDTO = z.infer<typeof updateEstablishmentSchema>
export type EstablishmentIdParamDTO = z.infer<typeof establishmentIdParamSchema>
