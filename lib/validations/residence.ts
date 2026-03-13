/**
 * Residence and Apartment Validation Schemas
 */

import { z } from 'zod'

/**
 * Residence creation schema
 */
export const createResidenceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  numberOfBuildings: z.number().int().positive().optional(),
  numberOfApartments: z.number().int().positive().optional(),
  contactPhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
  organizationId: z.string().min(1, 'Organization is required'),
})

/**
 * Residence update schema
 */
export const updateResidenceSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  postalCode: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  numberOfBuildings: z.number().int().positive().optional(),
  numberOfApartments: z.number().int().positive().optional(),
  contactPhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
})

/**
 * Apartment creation schema
 */
export const createApartmentSchema = z.object({
  number: z.string().min(1, 'Apartment number is required'),
  building: z.string().min(1, 'Building is required'),
  floor: z.number().int().min(0).optional(),
  type: z.enum(['T1', 'T2', 'T3', 'T4', 'Studio']).optional(),
  area: z.number().positive().optional(),
  residenceId: z.string().min(1, 'Residence is required'),
})

/**
 * Apartment update schema
 */
export const updateApartmentSchema = z.object({
  number: z.string().min(1).optional(),
  building: z.string().min(1).optional(),
  floor: z.number().int().min(0).optional(),
  type: z.enum(['T1', 'T2', 'T3', 'T4', 'Studio']).optional(),
  area: z.number().positive().optional(),
  status: z.enum(['OCCUPIED', 'VACANT']).optional(),
})

/**
 * Admin assignment to residence schema
 */
export const assignAdminSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  residenceId: z.string().min(1, 'Residence ID is required'),
})

// Type exports
export type CreateResidenceInput = z.infer<typeof createResidenceSchema>
export type UpdateResidenceInput = z.infer<typeof updateResidenceSchema>
export type CreateApartmentInput = z.infer<typeof createApartmentSchema>
export type UpdateApartmentInput = z.infer<typeof updateApartmentSchema>
export type AssignAdminInput = z.infer<typeof assignAdminSchema>
