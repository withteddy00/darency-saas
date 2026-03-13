# API Auth Guards - Migration Notes

## Overview

Created a centralized auth/RBAC module at `lib/auth/guards.ts` to eliminate duplication across 31 API routes.

## New Module: `lib/auth/guards.ts`

### Guard Functions

| Function | Use Case |
|----------|----------|
| `requireAuth()` | Any protected route |
| `requireRole(...roles)` | Role-specific routes |
| `requireOwner()` | OWNER-only routes |
| `requireAdmin()` | ADMIN-only routes |
| `requireResident()` | RESIDENT-only routes |
| `requireAdminOrOwner()` | Shared routes |
| `requireAdminWithResidence()` | ADMIN with residence scope |
| `requireResidentWithApartment()` | RESIDENT with apartment scope |

### Scoping Helpers

| Function | Use Case |
|----------|----------|
| `createResidenceFilter(user)` | Filter by admin's residence |
| `createApartmentFilter(user)` | Filter by resident's apartment |
| `createTenantFilter(user)` | Auto-scope based on role |
| `validateResidenceAccess(user, id)` | Check admin can access residence |

## Usage Pattern

### Before (Duplicated)
```typescript
// In every route file
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...business logic
}
```

### After (Centralized)
```typescript
// In route files
import { requireAdminWithResidence } from '@/lib/auth/guards'

export async function GET() {
  const auth = await requireAdminWithResidence()
  if (auth instanceof NextResponse) return auth
  
  const { residenceId, organizationId } = auth
  // ...business logic
}
```

## Routes Migrated

| Route File | Guard Used |
|------------|------------|
| `app/api/admin/dashboard/route.ts` | `requireAdminWithResidence` |
| `app/api/owner/dashboard/route.ts` | `requireOwner` |
| `app/api/resident/dashboard/route.ts` | `requireResidentWithApartment` |

## Remaining Routes (To Migrate)

### Owner Routes
- `app/api/owner/activity-logs/route.ts`
- `app/api/owner/admins/route.ts`
- `app/api/owner/plan/route.ts`
- `app/api/owner/plans/route.ts`
- `app/api/owner/reports/route.ts`
- `app/api/owner/residences-management/route.ts`
- `app/api/owner/residences/[id]/route.ts`
- `app/api/owner/residences/route.ts`
- `app/api/owner/subscription-requests/route.ts`
- `app/api/owner/subscriptions/route.ts`
- `app/api/owner/subscriptions/[id]/validate-payment/route.ts`
- `app/api/owner/users/route.ts`

### Admin Routes
- `app/api/admin/announcements/[id]/route.ts`
- `app/api/admin/announcements/route.ts`
- `app/api/admin/apartments/[id]/route.ts`
- `app/api/admin/apartments/route.ts`
- `app/api/admin/documents/[id]/route.ts`
- `app/api/admin/documents/route.ts`
- `app/api/admin/expenses/route.ts`
- `app/api/admin/maintenance/route.ts`
- `app/api/admin/payments/[id]/route.ts`
- `app/api/admin/payments/route.ts`

### Resident Routes
- `app/api/resident/announcements/route.ts`
- `app/api/resident/documents/route.ts`
- `app/api/resident/profile/route.ts`
- `app/api/resident/requests/route.ts`

### Shared Routes
- `app/api/charges/route.ts`
- `app/api/charges/[id]/route.ts`
- `app/api/residents/route.ts`
- `app/api/residents/[id]/route.ts`

## Migration Steps

1. **Add import** to route file:
```typescript
import { requireAdmin, createResidenceFilter } from '@/lib/auth/guards'
```

2. **Replace auth block**:
```typescript
// Before
const session = await getServerSession(authOptions)
if (!session || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// After  
const auth = await requireAdmin()
if (auth instanceof NextResponse) return auth
```

3. **Replace session usage**:
```typescript
// Before
session.user.residenceId

// After
auth.residenceId
```

4. **Use scoping helpers** where applicable:
```typescript
const filter = createResidenceFilter(auth)
const data = await prisma.model.findMany({ where: filter })
```

## Breaking Changes

- **Minimal**: Error messages slightly different (standardized)
- **Safe**: Response codes unchanged (401, 403)
- **Note**: Some routes have custom error messages that won't be preserved

## Testing

After migration, verify:
1. Authenticated users can access their routes
2. Unauthorized users get 401
3. Wrong role gets 403
4. ADMIN without residence gets 403
5. RESIDENT without apartment gets 403
