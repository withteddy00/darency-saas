# Validation Layer Documentation

## Overview

This document describes the Zod-based validation layer implemented across the API routes.

## Validation Coverage

### Completed Routes

| Route | Method | Schema | Status |
|-------|--------|--------|--------|
| `/api/owner/subscription-requests` | POST | `processSubscriptionRequestSchema` | ✅ |
| `/api/owner/users` | POST | `createUserSchema` | ✅ |
| `/api/charges` | POST | `createChargeSchema` | ✅ |

### Pending Routes

| Route | Method | Schema | Status |
|-------|--------|--------|--------|
| `/api/owner/residences` | POST | `createResidenceSchema` | Pending |
| `/api/owner/subscriptions/[id]/validate-payment` | POST | `validateSubscriptionPaymentSchema` | Pending |
| `/api/admin/payments` | POST | `validatePaymentSchema` | Pending |
| `/api/public/subscription-request` | POST | `createSubscriptionRequestSchema` | Pending |

## Schema Files

- `lib/validations/user.ts` - User auth schemas
- `lib/validations/subscription.ts` - Subscription schemas  
- `lib/validations/residence.ts` - Residence/Apartment schemas
- `lib/validations/finance.ts` - Charge/Payment schemas

## Helper Functions

- `validateBody(schema, data)` - Validate request body
- `validateQuery(schema, data)` - Validate query params
- `validateParams(schema, data)` - Validate URL params
- `parseAndValidate(schema, data, message)` - Parse + validate

## Error Response Format

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## Adding Validation to New Routes

1. Import the helpers:
```typescript
import { validateBody } from '@/lib/validations/helpers'
```

2. Import or create a schema:
```typescript
import { createUserSchema } from '@/lib/validations/user'
```

3. Use in route:
```typescript
export async function POST(request: Request) {
  const body = await request.json()
  const validation = validateBody(createUserSchema, body)
  
  if (validation instanceof NextResponse) {
    return validation  // Return error response
  }
  
  const { name, email } = validation  // Use validated data
  // ... rest of handler
}
```

## Best Practices

1. Always use Zod schemas for POST/PUT request bodies
2. Validate URL params for dynamic routes
3. Keep business logic validation separate from schema validation
4. Use descriptive error messages in schemas
5. Return consistent error format across all routes
