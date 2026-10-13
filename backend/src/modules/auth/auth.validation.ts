import { z } from 'zod';

export const loginSchema = z.object({ email: z.email(), password: z.string().min(8) });
export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
  phone: z.string().optional(),
  role: z.enum(['STUDENT', 'LECTURER', 'LIBRARIAN', 'MANAGER']).optional(),
});

