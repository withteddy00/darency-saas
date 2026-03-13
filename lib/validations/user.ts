/**
 * User and Auth Validation Schemas
 */

import { z } from 'zod'

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * User creation schema (for owner to create admin/resident)
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'RESIDENT']),
  residenceId: z.string().optional(),
  apartmentId: z.string().optional(),
  organizationId: z.string().min(1, 'Organization is required'),
  password: z.string().optional(),
})

/**
 * User update schema
 */
export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'RESIDENT']).optional(),
  residenceId: z.string().optional(),
  apartmentId: z.string().optional(),
})

/**
 * Password change schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
