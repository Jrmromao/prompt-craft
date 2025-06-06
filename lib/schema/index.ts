import { z } from 'zod';

export const sampleSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  practiceId: z.string().optional(),
  roleId: z.string(),
});
