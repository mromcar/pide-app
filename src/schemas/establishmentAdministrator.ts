import { z } from 'zod';

export const establishmentAdministratorIdSchema = z.object({
  userId: z.coerce.number().int().positive(),
  establishmentId: z.coerce.number().int().positive(),
});

export const establishmentAdministratorCreateSchema = z.object({
  userId: z.number().int().positive(),
  establishmentId: z.number().int().positive(),
});

// No specific update schema, as it's a composite key.
// Deletion would use the composite ID.

export type EstablishmentAdministratorCreateInput = z.infer<typeof establishmentAdministratorCreateSchema>;
