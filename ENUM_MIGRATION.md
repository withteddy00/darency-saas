# Prisma Enum Migration Notes

## Overview

This document details the enum migration for the darency-saas application.

## Why TypeScript Enums Instead of Prisma Enums?

**SQLite Limitation**: This project uses SQLite, which does not support native database enums. Prisma requires enum support in the database connector to generate Prisma enums.

**Solution**: TypeScript enums in `lib/enums.ts` provide compile-time type safety without requiring database-level enums.

## Enum Replacements

| Domain | TypeScript Enum | Values | Used In |
|--------|-----------------|--------|---------|
| User Role | `UserRole` | OWNER, ADMIN, RESIDENT | Auth guards, user queries |
| Subscription Status | `SubscriptionStatus` | ACTIVE, SUSPENDED, CANCELLED, EXPIRED | Subscriptions |
| Billing Cycle | `BillingCycle` | MONTHLY, YEARLY | Subscriptions, plans |
| Residence Status | `ResidenceStatus` | ACTIVE, INACTIVE, MAINTENANCE | Residences |
| Apartment Type | `ApartmentType` | T1, T2, T3, T4, Studio | Apartments |
| Apartment Status | `ApartmentStatus` | OCCUPIED, VACANT | Apartments |
| Occupancy Type | `OccupancyType` | OWNER_OCCUPIED, RENTED | Apartments |
| Payment Status | `PaymentStatus` | PENDING, PAID, OVERDUE | Payments |
| Payment Method | `PaymentMethod` | CASH, CARD, TRANSFER, CHEQUE | Payments |
| Charge Category | `ChargeCategory` | WATER, ELECTRICITY, ELEVATOR, CLEANING, SECURITY, OTHER | Charges |
| Maintenance Status | `MaintenanceStatus` | PENDING, IN_PROGRESS, COMPLETED, CANCELLED | Maintenance |
| Maintenance Priority | `MaintenancePriority` | LOW, MEDIUM, HIGH, URGENT | Maintenance |
| Maintenance Category | `MaintenanceCategory` | PLUMBING, ELECTRICAL, ELEVATOR, HVAC, OTHER | Maintenance |
| Announcement Type | `AnnouncementType` | GENERAL, URGENT, EVENT, MAINTENANCE | Announcements |
| Announcement Priority | `AnnouncementPriority` | NORMAL, HIGH | Announcements |
| Document Type | `DocumentType` | CONTRACT, INVOICE, RECEIPT, POLICY, OTHER | Documents |
| Language | `Language` | fr, ar, en | Subscription requests |
| Request Status | `SubscriptionRequestStatus` | PENDING, WAITING_PAYMENT, PAYMENT_PROOF_UPLOADED, APPROVED, REJECTED, EXPIRED | Subscription requests |

## Files Updated

1. **`lib/enums.ts`** - New file with all TypeScript enums and type guards
2. **`lib/auth/guards.ts`** - Updated to use `UserRole` enum

## Migration to PostgreSQL (Future)

When migrating to PostgreSQL:

1. Convert TypeScript enums to Prisma enums in `schema.prisma`:
```prisma
enum UserRole {
  OWNER
  ADMIN
  RESIDENT
}
```

2. Update field definitions:
```prisma
role UserRole @default(RESIDENT)
```

3. Remove `lib/enums.ts` or keep for frontend use

4. Regenerate Prisma client: `npx prisma generate`

## Type Guards

Each enum includes a type guard function for validation:

```typescript
import { isUserRole, UserRole } from '@/lib/enums'

function setRole(role: string) {
  if (isUserRole(role)) {
    // TypeScript now knows role is UserRole
    return role
  }
  throw new Error('Invalid role')
}
```

## Constants

Each enum includes a readonly array of values for dropdowns/validation:

```typescript
import { USER_ROLES, UserRole } from '@/lib/enums'

// For dropdown options
const roleOptions = USER_ROLES

// For type-safe comparisons
if (user.role === UserRole.ADMIN) { ... }
```

## Database Compatibility

- **SQLite**: TypeScript enums only (no DB constraints)
- **PostgreSQL**: Both TypeScript + Prisma enums recommended
- **MySQL**: Same as PostgreSQL

## Remaining Work

The following areas still use string literals and should be updated:

1. Frontend components (dropdowns, form defaults)
2. Seed files
3. API route handlers (create/update operations)

## Validation

Run type checking to find remaining string literals:

```bash
npx tsc --noEmit | grep "not assignable"
```
