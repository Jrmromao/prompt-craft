
import { z } from 'zod';

// User profile update validation schema
export const userProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  imageUrl: z.string()
    .url('Invalid image URL')
    .max(2048, 'Image URL must be less than 2048 characters')
    .optional(),
});

// User settings validation schema
export const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  
  emailNotifications: z.boolean(),
  
  marketingEmails: z.boolean(),
  
  language: z.enum(['en', 'es', 'fr', 'de', 'pt']),
});

// User feedback validation schema
export const userFeedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'other']),
  
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

// Types
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
export type UserFeedbackInput = z.infer<typeof userFeedbackSchema>;

// Validation functions
export const validateUserProfile = (data: unknown): UserProfileInput => {
  return userProfileSchema.parse(data);
};

export const validateUserSettings = (data: unknown): UserSettingsInput => {
  return userSettingsSchema.parse(data);
};

export const validateUserFeedback = (data: unknown): UserFeedbackInput => {
  return userFeedbackSchema.parse(data);
}; 