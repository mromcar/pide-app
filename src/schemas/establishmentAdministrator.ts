import { z } from 'zod';

export const establishmentAdministratorIdSchema = z.object({
  userId: z.coerce.number().int().positive(),
  establishmentId: z.coerce.number().int().positive(),
});

export const establishmentAdministratorCreateSchema = z.object({
  user_id: z.number().int().positive(),
  establishment_id: z.number().int().positive(),
});

// No specific update schema, as it's a composite key.
// Deletion would use the composite ID.

export type EstablishmentAdministratorCreateInput = z.infer<typeof establishmentAdministratorCreateSchema>;