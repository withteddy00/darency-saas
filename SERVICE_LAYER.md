# Backend Service Layer Architecture

## Overview

This document describes the new service layer architecture for the darency-saas backend.

## Current Problem

API route handlers currently mix:
- Authentication & authorization
- Input validation
- Business logic
- Prisma queries
- Response formatting

This makes routes hard to maintain and test.

## Target Architecture

```
lib/
├── auth/
│   ├── auth.ts          # NextAuth configuration
│   └── guards.ts         # Auth guard helpers (requireAdmin, etc.)
├── services/
│   ├── index.ts          # Exports
│   ├── payment.service.ts    # Payment business logic
│   └── dashboard.service.ts  # Dashboard aggregation
├── prisma.ts            # Database client
└── activity-log.ts       # Activity logging
```

## New Service Modules

### 1. Payment Service (`lib/services/payment.service.ts`)

**Responsibility**: Payment CRUD, filtering, statistics

| Function | Description |
|----------|-------------|
| `getPayments(filters, options)` | List payments with filtering |
| `getPaymentById(id)` | Get single payment |
| `getPaymentStats(residenceId)` | Get payment statistics |
| `createPayment(data, userId, orgId)` | Create new payment |
| `updatePaymentStatus(id, status, ...)` | Update payment status |
| `recordPayment(id, method, userId, orgId)` | Record a payment as PAID |

**Types**:
```typescript
interface PaymentFilters {
  status?: string
  residenceId?: string
  apartmentId?: string
  month?: number
  year?: number
}

interface PaymentWithDetails {
  id: string
  amount: number
  status: string
  method: string | null
  paidDate: string | null
  dueDate: string
  notes: string | null
  apartment?: { number: string, building: string, residence: { name: string } }
  charge?: { title: string, month: number, year: number }
}
```

### 2. Dashboard Service (`lib/services/dashboard.service.ts`)

**Responsibility**: Dashboard statistics aggregation

| Function | Description |
|----------|-------------|
| `getOwnerDashboardStats()` | Platform-wide statistics |
| `getTopResidencesByRevenue(limit)` | Top residences |
| `getAdminDashboardStats(residenceId)` | Per-residence stats |
| `getResidentDashboardStats(userId, aptId)` | Per-user stats |

**Types**:
```typescript
interface OwnerDashboardStats {
  totalResidences: number
  totalAdmins: number
  totalResidents: number
  totalOrganizations: number
  activeSubscriptions: number
  pendingRequests: number
  monthlyRevenue: number
  totalPayments: number
  totalCharges: number
  totalExpenses: number
  netRevenue: number
}

interface AdminDashboardStats {
  residence: { id, name, address, city }
  apartments: { total, occupied, vacant, occupancyRate }
  residents: { total }
  charges: { total, paid, pending, overdue }
  payments: { total, collected, pending, collectionRate }
  expenses: { total, thisMonth }
  maintenanceRequests: { open, inProgress, completed }
}

interface ResidentDashboardStats {
  apartment: { number, building, type }
  residence: { id, name, address }
  charges: { unpaid, paid, total, pendingPayments, paidPayments }
  payments: { total, totalAmount, latestPayment, recent }
  maintenanceRequests: { open, inProgress, completed, recent }
}
```

## Migration Pattern

### Before (Route Handler)
```typescript
// app/api/admin/payments/route.ts
export async function GET() {
  // 1. Auth
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Validation & Business Logic
  const residenceId = session.user.residenceId
  const payments = await prisma.payment.findMany({
    where: { apartment: { residenceId } },
    include: { apartment: true, charge: true }
  })

  // 3. Response Formatting
  return NextResponse.json({
    payments: payments.map(p => ({ ... }))
  })
}
```

### After (Thin Route + Service)
```typescript
// app/api/admin/payments/route.ts
import { requireAdminWithResidence } from '@/lib/auth/guards'
import { getPayments } from '@/lib/services/payment.service'

export async function GET() {
  // 1. Auth (guard returns user or error response)
  const auth = await requireAdminWithResidence()
  if (auth instanceof NextResponse) return auth

  // 2. Delegate to service
  const payments = await getPayments({ 
    residenceId: auth.residenceId 
  })

  // 3. Return response
  return NextResponse.json({ payments })
}
```

## Benefits

1. **Separation of Concerns**: Auth, validation, business logic separated
2. **Testability**: Services can be unit tested with mocks
3. **Reusability**: Multiple routes can share service functions
4. **Maintainability**: Changes to business logic only in one place
5. **Type Safety**: Centralized types in service modules

## Planned Services (Future)

- `subscription.service.ts` - Subscription management
- `residence.service.ts` - Residence CRUD
- `user.service.ts` - User management
- `charge.service.ts` - Charge management
- `report.service.ts` - Report generation

## Routes Using Services

Currently no routes have been migrated - services are ready for adoption. See migration guides in:
- `AUTH_GUARDS_MIGRATION.md` - Auth guard migration
- (Future) Service migration documentation

## Dependencies

- `lib/prisma` - Database client
- `lib/activity-log` - Activity logging
- `lib/auth/guards` - Authentication guards

## Notes

- Services handle their own Prisma queries (no repository layer yet)
- Services include activity logging where appropriate
- Response formatting happens in services (not routes)
- All dates are converted to ISO strings in services
