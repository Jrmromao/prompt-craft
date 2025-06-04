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

  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),

  jobTitle: z.string()
    .max(100, 'Job title must be less than 100 characters')
    .optional(),

  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),

  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),

  website: z.string()
    .url('Invalid website URL')
    .max(2048, 'Website URL must be less than 2048 characters')
    .optional(),

  twitter: z.string()
    .max(50, 'Twitter handle must be less than 50 characters')
    .regex(/^@?[A-Za-z0-9_]+$/, 'Invalid Twitter handle format')
    .optional(),

  linkedin: z.string()
    .max(100, 'LinkedIn profile URL must be less than 100 characters')
    .url('Invalid LinkedIn profile URL')
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

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  jobTitle: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  website: z.string().url().optional(),
  twitter: z.string().max(50).optional(),
  linkedin: z.string().url().optional(),
}).refine((data) => {
  // Ensure at least one field is provided
  return Object.keys(data).length > 0;
}, {
  message: "At least one field must be provided for update",
}); 