// src/types/dtos/user.ts
import { z } from 'zod';
import {
  createUserSchema,         // Asumiendo que existe en src/schemas/user.ts
  updateUserSchema,         // Asumiendo que existe en src/schemas/user.ts
  userIdParamSchema,        // Asumiendo que existe en src/schemas/user.ts
  // loginUserSchema,       // Ejemplo: si tienes un esquema para login
  // changePasswordSchema,  // Ejemplo: si tienes un esquema para cambio de contraseña
} from '../../schemas/user';

// Tipos inferidos de los esquemas Zod para el cuerpo de la solicitud (request body)
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
// export type LoginUserDTO = z.infer<typeof loginUserSchema>;
// export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;


// Tipos inferidos para parámetros de ruta (route params)
export type UserIdParamDTO = z.infer<typeof userIdParamSchema>;
