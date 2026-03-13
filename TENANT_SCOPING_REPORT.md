# Multi-Tenant Architecture Report

## Executive Summary

This document details the multi-tenant scoping implementation for the darency-saas application.

## Tenant Hierarchy

```
Organization (Tenant)
├── OWNER (platform admin)
└── Residences
    ├── ADMIN (syndic/manager)
    └── Apartments
        └── RESIDENT (tenant)
```

## Scoping Rules by Role

| Role | Scope Level | Accessible Data |
|------|-------------|-----------------|
| OWNER | Organization | All residences, apartments, users within their organization |
| ADMIN | Residence | Only their assigned residence and its apartments/residents |
| RESIDENT | Apartment | Only their apartment, charges, and payments |

## New Tenant Scoping Module

### File: `lib/tenant.ts`

Core functions for tenant-aware queries:

| Function | Description |
|----------|-------------|
| `getTenantScope(user)` | Returns 'organization', 'residence', 'apartment', or 'none' |
| `buildTenantFilter(user)` | Builds Prisma where clause based on user role |
| `validateResidenceAccess(user, id)` | Validates ADMIN can access residence |
| `getApartments(user, options)` | Scoped apartment queries |
| `getCharges(user, options)` | Scoped charge queries |
| `getPayments(user, options)` | Scoped payment queries |
| `getResidences(user, options)` | Scoped residence queries |
| `getUsers(user, options)` | Scoped user (resident) queries |
| `getExpenses(user, options)` | Scoped expense queries |
| `getMaintenanceRequests(user, options)` | Scoped maintenance queries |
| `getAnnouncements(user, options)` | Scoped announcement queries |
| `getDocuments(user, options)` | Scoped document queries |
| `verifyAccess(user, type, id)` | Verify user can access specific resource |

## Route Analysis

### Routes with Proper Scoping

| Route | Method | Protection |
|-------|--------|------------|
| `app/api/charges/route.ts` | GET, POST | ✅ residenceId filter for ADMIN |
| `app/api/charges/[id]/route.ts` | GET, PUT, DELETE | ✅ residenceId filter |
| `app/api/admin/dashboard/route.ts` | GET | ✅ residenceId from session |
| `app/api/admin/expenses/route.ts` | GET, POST | ✅ residenceId filter |
| `app/api/admin/payments/route.ts` | GET, POST | ✅ residenceId filter |
| `app/api/admin/payments/[id]/route.ts` | GET, PUT | ✅ residenceId filter |
| `app/api/admin/apartments/route.ts` | GET, POST | ✅ residenceId filter |
| `app/api/admin/announcements/route.ts` | GET, POST | ✅ residenceId filter |
| `app/api/owner/dashboard/route.ts` | GET | ✅ OWNER only |
| `app/api/owner/residences/route.ts` | GET, POST | ✅ OWNER only |
| `app/api/owner/residences/[id]/route.ts` | GET, PUT, DELETE | ✅ OWNER only |
| `app/api/owner/users/route.ts` | GET | ✅ OWNER only |
| `app/api/owner/subscriptions/route.ts` | GET, POST | ✅ OWNER only |
| `app/api/resident/dashboard/route.ts` | GET | ✅ user.id filter |
| `app/api/resident/profile/route.ts` | GET, PUT | ✅ user.id filter |
| `app/api/resident/requests/route.ts` | GET, POST | ✅ apartmentId filter |
| `app/api/residents/route.ts` | GET, POST | ✅ ADMIN/OWNER residence filter |

### Public Routes (No Auth Required)

| Route | Method | Notes |
|-------|--------|-------|
| `app/api/public/plans/route.ts` | GET | ✅ Public - subscription plans |
| `app/api/public/subscription-request/route.ts` | POST | ✅ Public - new requests |
| `app/api/public/payment-proof/route.ts` | POST | ✅ Public - proof upload |

### Owner-Only Routes

| Route | Method | Protection |
|-------|--------|------------|
| `app/api/owner/plan/route.ts` | GET | ✅ OWNER only |
| `app/api/owner/plans/route.ts` | GET | ✅ OWNER only |
| `app/api/owner/subscription-request/route.ts` | GET | ✅ OWNER only |
| `app/api/owner/admins/route.ts` | GET, POST | ✅ OWNER only |
| `app/api/owner/subscription-requests/route.ts` | GET, POST | ✅ OWNER only |
| `app/api/owner/reports/route.ts` | GET | ✅ OWNER only |
| `app/api/owner/activity-logs/route.ts` | GET | ✅ OWNER only |
| `app/api/owner/residences-management/route.ts` | GET | ✅ OWNER only |

## Schema Protection

### Required Relations

The Prisma schema enforces tenant relationships:

```prisma
// User must belong to an organization
organizationId String
organization   Organization @relation(...)

// ADMIN must be linked to a residence
adminForResidenceId String?
adminForResidence   Residence? @relation("AdminResidence", ...)

// RESIDENT must be linked to an apartment
apartmentId String? @unique
apartment   Apartment? @relation("ResidentApartment", ...)

// Residence must belong to an organization
organizationId String
organization   Organization @relation(...)

// Apartment must belong to a residence
residenceId String
residence   Residence @relation(...)

// All charges/payments link to apartments
apartmentId String
apartment   Apartment @relation(...)
```

## Usage Example

### Before (Manual Scoping)
```typescript
// In route handler - error prone
export async function GET() {
  const session = await getServerSession(authOptions)
  let filter = {}
  if (session.user.role === 'ADMIN') {
    filter = { residenceId: session.user.residenceId }
  }
  const data = await prisma.charge.findMany({ where: filter })
}
```

### After (Tenant Helper)
```typescript
// In route handler - consistent and safe
import { buildTenantFilter, getCharges } from '@/lib/tenant'

export async function GET() {
  const auth = await requireAdminWithResidence()
  if (auth instanceof NextResponse) return auth
  
  const charges = await getCharges(auth)
}
```

## Remaining Risks

### High Priority
1. **No automatic enforcement**: Developers must remember to use tenant helpers
2. **Admin users table**: `app/api/admin/*` routes check session but some could be more explicit
3. **Subscription scoping**: Owner subscription queries should verify organization ownership

### Medium Priority
1. **Bulk operations**: No scoped bulk delete/update helpers
2. **Cross-tenant validation**: No database-level constraints preventing cross-org access

### Mitigation Strategies
1. Use TypeScript to require tenant scope in all API handlers
2. Add Prisma middleware for automatic tenant filtering (future enhancement)
3. Add database constraints for critical relations

## Migration Path

1. **Phase 1** (Complete): Create `lib/tenant.ts` with helpers ✅
2. **Phase 2**: Migrate high-traffic routes to use tenant helpers
3. **Phase 3**: Add Prisma middleware for automatic filtering
4. **Phase 4**: Add database constraints

## Testing Recommendations

1. Test ADMIN can only see their residence data
2. Test RESIDENT can only see their apartment data
3. Test OWNER can see all data in their organization
4. Test cross-tenant access attempts return null/403
5. Test subscription boundaries
