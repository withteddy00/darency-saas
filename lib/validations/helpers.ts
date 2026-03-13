/**
 * Validation Helpers
 * 
 * Shared utilities for API route validation using Zod.
 */

import { NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'

/**
 * Validates request body against a Zod schema
 * Returns parsed data on success, or error response on failure
 */
export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T | NextResponse {
  try {
    return schema.parse(data) as T
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>, data: unknown): T | NextResponse {
  try {
    return schema.parse(data) as T
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
      return NextResponse.json(
        { error: 'Invalid query parameters', details: errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Invalid query parameters' },
      { status: 400 }
    )
  }
}

/**
 * Validates URL params against a Zod schema
 */
export function validateParams<T>(schema: ZodSchema<T>, data: unknown): T | NextResponse {
  try {
    return schema.parse(data) as T
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
      return NextResponse.json(
        { error: 'Invalid URL parameters', details: errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Invalid URL parameters' },
      { status: 400 }
    )
  }
}

/**
 * Safely parses JSON and validates with Zod
 * Use this when you need to parse JSON manually before validation
 */
export function parseAndValidate<T>(
  schema: ZodSchema<T>, 
  data: unknown,
  errorMessage = 'Validation failed'
): T | NextResponse {
  try {
    return schema.parse(data) as T
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
      return NextResponse.json(
        { error: errorMessage, details: errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
