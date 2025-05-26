import { z } from 'zod';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../../schemas/user';

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UserIdParamDTO = z.infer<typeof userIdParamSchema>;
