// ============================================================================
// VALIDATION SCHEMAS
// Central validation using Zod for all API inputs
// ============================================================================

import { z } from 'zod';
import { VALIDATION_PATTERNS, VALID_DELETION_TYPES, VALID_EXPORT_FORMATS, VALID_TASK_ACTIONS } from '@/lib/constants';

// Common validation patterns
export const uuidSchema = z.string().regex(VALIDATION_PATTERNS.UUID, 'Invalid UUID format');
export const emailSchema = z.string().regex(VALIDATION_PATTERNS.EMAIL, 'Invalid email format');
export const urlSchema = z.string().url('Invalid URL format');
export const swissPostalCodeSchema = z.string().regex(VALIDATION_PATTERNS.SWISS_POSTAL_CODE, 'Invalid Swiss postal code');
export const phoneSchema = z.string().regex(VALIDATION_PATTERNS.PHONE, 'Invalid Swiss phone number');

// Document-related schemas
export const DocumentDownloadSchema = z.object({
  documentId: uuidSchema
  // userId removed - now using authenticated user context
});

export const DocumentUploadSchema = z.object({
  file: z.instanceof(File).refine(f => f instanceof File, 'File is required'),
  category: z.string().optional(),
  description: z.string().optional()
});

// User profile schemas - Flexible for all profile fields
export const ProfileUpdateSchema = z.object({
  user_id: z.string().optional(),
  email: emailSchema.optional(),
  updated_at: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  moved_to_switzerland: z.string().optional(),
  planning_to_stay: z.string().optional(),
  country_of_origin: z.string().optional(),
  last_residence_country: z.string().optional(),
  date_of_birth: z.string().optional(),
  living_with: z.string().optional(),
  home_address: z.string().optional(),
  postal_code: z.string().optional(),
  municipality: z.string().optional(),
  canton: z.string().optional(),
  has_children: z.boolean().optional(),
  children_ages: z.string().optional(),
  current_situation: z.string().optional(),
  interests: z.string().optional(),
  primary_language: z.string().optional(),
  about_me: z.string().optional(),
  profile_image_url: z.string().optional()
}).passthrough();

// Task-related schemas
export const TaskActionSchema = z.object({
  taskId: uuidSchema,
  action: z.enum(VALID_TASK_ACTIONS),
  reminderTime: z.string().optional()
});

// Email schemas
export const EmailTestSchema = z.object({
  recipient: emailSchema,
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required')
});

// Municipality/School schemas
export const MunicipalitySearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100),
  limit: z.number().min(1).max(50).optional().default(10)
});

export const MunicipalityEmailSchema = z.object({
  municipality: z.string().min(1, 'Municipality is required'),
  canton: z.string().min(1, 'Canton is required'),
  userEmail: emailSchema.optional()
});

export const SchoolWebsiteSchema = z.object({
  municipality: z.string().min(1, 'Municipality is required'),
  canton: z.string().min(1, 'Canton is required')
});

export const SchoolEmailSchema = z.object({
  municipality: z.string().min(1, 'Municipality is required'),
  canton: z.string().min(1, 'Canton is required'),
  userEmail: emailSchema.optional(),
  childrenAges: z.array(z.number()).optional()
});

// GDPR schemas
export const GDPRExportSchema = z.object({
  format: z.enum(VALID_EXPORT_FORMATS).optional().default('readable')
});

export const GDPRDeleteSchema = z.object({
  confirmation: z.literal('DELETE_MY_ACCOUNT'),
  verificationToken: z.string().optional(),
  deletion_type: z.enum(VALID_DELETION_TYPES).optional().default('full_deletion')
});

// Validation helper functions
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    throw error;
  }
}

export function validateQueryParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T {
  const params = Object.fromEntries(searchParams.entries());
  return validateInput(schema, params);
}

export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  return validateInput(schema, body);
}
