/**
 * Subscription Request Validation Schemas
 */

import { z } from 'zod'

/**
 * Subscription request creation schema
 */
export const createSubscriptionRequestSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  organizationName: z.string().optional(),
  residenceName: z.string().min(1, 'Residence name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().optional(),
  numberOfBuildings: z.number().int().positive().optional(),
  numberOfFloors: z.number().int().positive().optional(),
  numberOfApartments: z.number().int().positive('Number of apartments must be positive'),
  planId: z.string().optional(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).optional(),
  notes: z.string().optional(),
  ice: z.string().optional(),
  rc: z.string().optional(),
  taxId: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
})

/**
 * Subscription request approval/rejection schema
 */
export const processSubscriptionRequestSchema = z.object({
  action: z.enum(['approve', 'reject']),
  requestId: z.string().min(1, 'Request ID is required'),
  notes: z.string().optional(),
})

/**
 * Subscription validation schema (for payment validation)
 */
export const validateSubscriptionPaymentSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER', 'CHEQUE']),
  notes: z.string().optional(),
})

// Type exports
export type CreateSubscriptionRequestInput = z.infer<typeof createSubscriptionRequestSchema>
export type ProcessSubscriptionRequestInput = z.infer<typeof processSubscriptionRequestSchema>
export type ValidateSubscriptionPaymentInput = z.infer<typeof validateSubscriptionPaymentSchema>
