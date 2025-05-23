import { z } from 'zod';
import {
  createUserSchema, // Deberás crear este schema en src/schemas/user.ts
  updateUserSchema, // Deberás crear este schema en src/schemas/user.ts
  userIdParamSchema, // Deberás crear este schema en src/schemas/user.ts
  // loginUserSchema, // Opcional: si tienes un endpoint de login
  // changePasswordSchema, // Opcional: para cambio de contraseña
} from '../../schemas/user'; // Ajusta la ruta si es necesario

// --- User DTOs ---
// Para crear un nuevo usuario
export type CreateUserDTO = z.infer<typeof createUserSchema>;

// Para actualizar un usuario existente
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

// --- User Route Param DTOs ---
// Para parámetros de ruta que contienen un ID de usuario
export type UserIdParamDTO = z.infer<typeof userIdParamSchema>;

// --- Auth DTOs (Opcional) ---
// Ejemplo: Para el cuerpo de la solicitud de login
// export type LoginUserDTO = z.infer<typeof loginUserSchema>;

// Ejemplo: Para cambiar la contraseña
// export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

// Si 'User' tuviera campos traducibles (menos común para usuarios, pero para seguir el patrón):
// import { userTranslationSchema } from '../../schemas/user';
// export type UserTranslationDTO = z.infer<typeof userTranslationSchema>;
