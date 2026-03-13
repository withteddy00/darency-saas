/**
 * Charges and Payments Validation Schemas
 */

import { z } from 'zod'

/**
 * Charge creation schema
 */
export const createChargeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be positive'),
  month: z.number().int().min(1).max(12, 'Month must be 1-12'),
  year: z.number().int().min(2000, 'Year must be valid'),
  category: z.enum(['WATER', 'ELECTRICITY', 'ELEVATOR', 'CLEANING', 'SECURITY', 'OTHER']).optional(),
  dueDate: z.string().datetime().optional(),
  apartmentId: z.string().min(1, 'Apartment is required'),
  residenceId: z.string().min(1, 'Residence is required'),
  description: z.string().optional(),
})

/**
 * Charge update schema
 */
export const updateChargeSchema = z.object({
  title: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).optional(),
  category: z.enum(['WATER', 'ELECTRICITY', 'ELEVATOR', 'CLEANING', 'SECURITY', 'OTHER']).optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
})

/**
 * Payment creation schema
 */
export const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']),
  method: z.enum(['CASH', 'CARD', 'TRANSFER', 'CHEQUE']).optional(),
  paidDate: z.string().datetime().optional(),
  dueDate: z.string().datetime(),
  apartmentId: z.string().optional(),
  chargeId: z.string().optional(),
  subscriptionId: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * Payment update schema (for validating payments)
 */
export const validatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']),
  method: z.enum(['CASH', 'CARD', 'TRANSFER', 'CHEQUE']),
  paidDate: z.string().datetime().optional(),
  notes: z.string().optional(),
})

/**
 * Payment proof upload schema
 */
export const paymentProofSchema = z.object({
  paymentReference: z.string().min(1, 'Payment reference is required'),
})

// Type exports
export type CreateChargeInput = z.infer<typeof createChargeSchema>
export type UpdateChargeInput = z.infer<typeof updateChargeSchema>
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type ValidatePaymentInput = z.infer<typeof validatePaymentSchema>
export type PaymentProofInput = z.infer<typeof paymentProofSchema>
