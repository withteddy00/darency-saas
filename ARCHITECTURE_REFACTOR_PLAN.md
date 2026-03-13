# Architecture Refactor Plan

> Generated: 2026-03-12
> Project: darency-saas (Next.js 14 + TypeScript + Prisma)

---

## Executive Summary

This document outlines architectural issues found in the codebase and provides a phased refactoring plan. The goal is to improve maintainability, security, and performance without breaking existing functionality.

**Priority Matrix:**
| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| P0 | Auth duplication | HIGH | HIGH |
| P0 | Multi-tenant gaps | HIGH | MEDIUM |
| P1 | Missing indexes | MEDIUM | LOW |
| P1 | String enums | MEDIUM | MEDIUM |
| P2 | i18n architecture | MEDIUM | HIGH |
| P2 | Client components | LOW | MEDIUM |
| P3 | No service layer | LOW | HIGH |

---

## Issue 1: Duplicated Auth / RBAC Checks in API Routes

### Current Problem
Every API route repeats the same authentication and authorization logic:
- `getServerSession()` call
- Role check (`session.user.role !== 'X'`)
- Residence scoping for ADMIN users

### Example (from `app/api/charges/route.ts`)
```typescript
const session = await getServerSession(authOptions)
if (!session || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
if (session.user.role === 'ADMIN' && !session.user.residenceId) {
  return NextResponse.json({ error: 'Admin residence not assigned' }, { status: 403 })
}
```

### Risk Level: **HIGH**
- Inconsistent authorization checks between routes
- Easy to forget scoping in new routes
- Maintenance nightmare as routes grow

### Files Impacted
- `app/api/charges/route.ts`
- `app/api/admin/*/route.ts` (12 files)
- `app/api/owner/*/route.ts` (10 files)
- `app/api/resident/*/route.ts` (5 files)
- `app/api/charges/[id]/route.ts`
- `app/api/residents/[id]/route.ts`

### Proposed Solution

**Option A: Middleware-based auth (Recommended)**
1. Create auth middleware that handles `/api/*` routes
2. Add `authorization` header with JWT
3. Validate and attach user context to request headers

**Option B: Service layer**
1. Create `lib/auth/service.ts`:
```typescript
// lib/auth/service.ts
export async function requireAuth(allowedRoles: string[]) {
  const session = await getServerSession(authOptions)
  if (!session) throw new AuthError('Unauthorized')
  if (!allowedRoles.includes(session.user.role)) throw new AuthError('Forbidden')
  return session
}

export async function requireResidence(session: Session) {
  if (session.user.role === 'ADMIN' && !session.user.residenceId) {
    throw new AuthError('Residence not assigned')
  }
  return session.user.residenceId
}
```

2. Use in routes:
```typescript
import { requireAuth, requireResidence } from '@/lib/auth/service'

export async function GET() {
  const session = await requireAuth(['ADMIN', 'OWNER'])
  const residenceId = await requireResidence(session)
  // ...
}
```

### Migration Risk: **MEDIUM**
- Requires updating all API routes
- Must maintain backward compatibility during transition
- Use gradual migration (one route at a time)

### Implementation Order
1. Create auth service library
2. Update 3-5 routes as pilot
3. Create linting rule to enforce usage
4. Migrate remaining routes

---

## Issue 2: Weak Multi-Tenant Scoping

### Current Problem
- No automatic tenant isolation at database level
- Each route manually adds `organizationId` or `residenceId` filters
- Easy to accidentally expose data from other tenants

### Example (from `app/api/admin/dashboard/route.ts`)
```typescript
const residenceId = session.user.residenceId  // Manual filter
if (!residenceId) { return error }
const residence = await prisma.residence.findUnique({ where: { id: residenceId } })
```

### Risk Level: **HIGH**
- Potential data leakage between organizations
- Inconsistent filtering across routes

### Files Impacted
- All admin API routes
- All owner API routes
- `lib/prisma.ts`

### Proposed Solution

**1. Create tenant context helper:**
```typescript
// lib/tenant.ts
export async function getTenantContext(session: Session) {
  return {
    organizationId: session.user.organizationId,
    residenceId: session.user.residenceId,
    role: session.user.role
  }
}

export function createTenantFilter(session: Session, resource: 'residence' | 'apartment' | 'charge') {
  if (session.user.role === 'OWNER') return {}
  if (session.user.role === 'ADMIN') return { residenceId: session.user.residenceId }
  if (session.user.role === 'RESIDENT') return { apartment: { residenceId: session.user.residenceId } }
  return {}
}
```

**2. Create Prisma middleware for automatic scoping:**
```typescript
// lib/prisma/tenant-middleware.ts
export const tenantMiddleware = async (params: Prisma.MiddlewareParams, next: any) => {
  // Add tenant filtering based on session context
  // This requires passing session through to Prisma
}
```

### Migration Risk: **MEDIUM**
- Must ensure existing queries still work
- Test thoroughly with multi-tenant scenarios

### Implementation Order
1. Create tenant context utilities
2. Update admin routes to use consistent filtering
3. Add tests for tenant isolation

---

## Issue 3: String-Based Enums in Prisma Schema

### Current Problem
All enums are stored as strings:
```prisma
role          String   @default("RESIDENT") // OWNER, ADMIN, RESIDENT
status        String   @default("ACTIVE")   // ACTIVE, INACTIVE, SUSPENDED
billingCycle  String   @default("MONTHLY")  // MONTHLY, YEARLY
```

### Risk Level: **MEDIUM**
- No compile-time type checking
- Easy to misspell values
- Database accepts any string

### Files Impacted
- `prisma/schema.prisma`
- All API routes using status/role values
- All frontend components

### Proposed Solution

**Phase 1: Add Prisma enums (non-breaking)**
```prisma
enum UserRole {
  OWNER
  ADMIN
  RESIDENT
}

enum SubscriptionStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  CANCELLED
  EXPIRED
}

enum BillingCycle {
  MONTHLY
  YEARLY
}

// Then update models:
role          UserRole           @default(RESIDENT)
status        SubscriptionStatus @default(ACTIVE)
billingCycle  BillingCycle       @default(MONTHLY)
```

**Phase 2: Update TypeScript types**
```typescript
// types/enums.ts
export const UserRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  RESIDENT: 'RESIDENT'
} as const
export type UserRole = typeof UserRole[keyof typeof UserRole]
```

**Phase 3: Generate migration**
```bash
npx prisma migrate dev --name add_enums
```

### Migration Risk: **HIGH**
- Requires database migration
- Must update all string comparisons in code
- Potential downtime if not careful

### Implementation Order
1. Add TypeScript enum types (safe, no DB change)
2. Add Prisma enums in schema (non-breaking)
3. Run migration
4. Update API routes to use enum values
5. Remove string fallbacks

---

## Issue 4: Duplicated Admin/User Relationship Modeling

### Current Problem
Two separate ways to model admin users:
1. `User` model with `role: 'ADMIN'` + `adminForResidenceId`
2. `Admin` model (explicit relation table)

```prisma
// User model
adminForResidenceId String?
adminForResidence   Residence? @relation("AdminResidence", ...)

// Separate Admin model
model Admin {
  userId      String
  user        User     @relation(...)
  residenceId String
  residence   Residence @relation(...)
  @@unique([userId, residenceId])
}
```

### Risk Level: **MEDIUM**
- Confusion about which to use
- Potential for data inconsistency
- Redundant relationships

### Files Impacted
- `prisma/schema.prisma`
- `app/api/owner/admins/route.ts`
- `app/api/owner/users/route.ts`
- Any code using admin relationships

### Proposed Solution

**Option A: Keep User model only (Recommended)**
1. Deprecate Admin model
2. Use User with role + adminForResidenceId
3. Add validation: ADMIN must have adminForResidenceId

**Option B: Keep Admin model only**
1. Remove admin fields from User model
2. Use Admin model for all admin relationships
3. Update queries

### Migration Risk: **MEDIUM**
- Must ensure data consistency
- Update seed data

---

## Issue 5: Weak i18n Architecture

### Current Problem
- Manual locale extraction from URL
- No server-side translations
- Custom `useTranslations` hook loads JSON on client

```typescript
// Current approach - client-side only
import frTranslations from '@/lib/locales/fr/translation.json'
const translations = { fr: frTranslations, ar: arTranslations }
```

### Risk Level: **MEDIUM**
- Translations loaded on every page load
- No lazy loading
- SEO issues with translations

### Files Impacted
- `app/[locale]/*` (all pages)
- `hooks/use-translations.tsx`
- `middleware.ts`
- `app/layout.tsx`

### Proposed Solution

**Implement next-intl:**
```bash
npm install next-intl
```

```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`@/messages/${locale}.json`)).default
}))
```

Benefits:
- Server-side translations
- Automatic locale detection
- Built-in routing
- Message flattening

### Migration Risk: **HIGH**
- Major change to all pages
- Test all translations work

---

## Issue 6: Too Many Client Components

### Current Problem
- 35 client components in a Next.js 14 app
- Many pages don't need interactivity
- Larger JavaScript bundles

### Example
```typescript
// page.tsx - Server component by default in App Router
// But forced to client for simple display:
'use client'
export default function Page() {
  return <div>Static content</div>
}
```

### Risk Level: **LOW**
- Performance impact
- SEO impact

### Files Impacted
- All pages in `app/[locale]`

### Proposed Solution

1. Run audit:
```bash
find app -name "*.tsx" -exec grep -l "use client" {} \; | wc -l
```

2. Identify pages that can be server components:
   - Pages with only data fetching and display
   - Pages without user interaction
   - Pages without state

3. Convert to server components:
```typescript
// Before
'use client'
export default function Page() {
  const data = useData()
  return <div>{data}</div>
}

// After - Server component
export default async function Page() {
  const data = await getData()
  return <div>{data}</div>
}
```

### Migration Risk: **LOW**
- Safe gradual conversion
- Test each page after conversion

---

## Issue 7: Weak Request Validation

### Current Problem
- No schema validation (Zod, Yup, etc.)
- Manual validation in each route:
```typescript
if (!title || !amount || !month || !year || !apartmentId) {
  return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
}
```

### Risk Level: **MEDIUM**
- Inconsistent validation
- Easy to miss edge cases

### Files Impacted
- All POST/PATCH routes

### Proposed Solution

**Add Zod:**
```bash
npm install zod
```

```typescript
// schemas/charge.ts
import { z } from 'zod'

export const ChargeSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
  apartmentId: z.string()
})

// In route:
const body = ChargeSchema.parse(await request.json())
```

### Migration Risk: **LOW**
- Add alongside existing validation
- Gradual adoption

---

## Issue 8: Missing Performance/Indexing Strategy

### Current Problem
- No indexes in Prisma schema
- Missing indexes on frequently queried fields:
  - `organizationId` on User
  - `residenceId` on Apartment
  - `apartmentId` on Payment
  - `status` fields for filtering

### Example
```prisma
model Payment {
  // No indexes!
  apartmentId String?
  chargeId     String?
  subscriptionId String?
}
```

### Risk Level: **MEDIUM**
- Slow queries at scale
- Poor performance as data grows

### Files Impacted
- `prisma/schema.prisma`

### Proposed Solution

Add indexes:
```prisma
model Payment {
  id            String   @id
  apartmentId   String?
  chargeId      String?
  subscriptionId String?
  
  @@index([apartmentId])
  @@index([chargeId])
  @@index([subscriptionId])
  @@index([status])
}

model User {
  organizationId String
  
  @@index([organizationId])
  @@index([email])
  @@index([role])
}

model Apartment {
  residenceId String
  
  @@index([residenceId])
  @@index([status])
}
```

Then migrate:
```bash
npx prisma migrate dev --name add_indexes
```

### Migration Risk: **LOW**
- Non-breaking change
- Improves performance

---

## Implementation Roadmap

### Phase 1: Quick Wins (Week 1)
1. [ ] Add Prisma indexes
2. [ ] Add Zod for new routes
3. [ ] Create auth service helper
4. [ ] Add TypeScript enums

**Impact:** High performance improvement, better type safety

### Phase 2: Core Refactoring (Week 2-3)
1. [ ] Implement auth service in 50% of routes
2. [ ] Create tenant context utilities
3. [ ] Fix string enum issues
4. [ ] Add indexes migration

**Impact:** Better security, consistent patterns

### Phase 3: Advanced Improvements (Week 4+)
1. [ ] Migrate to next-intl
2. [ ] Convert client components to server
3. [ ] Full auth service adoption
4. [ ] Deprecate Admin model

**Impact:** Better SEO, performance, maintainability

---

## Breaking Changes to Avoid

1. **Don't** change database provider without full migration plan
2. **Don't** remove fields without checking usage
3. **Don't** change auth tokens without testing sessions
4. **Don't** modify middleware without thorough testing

---

## Recommendations

### Do First
1. Add Prisma indexes (low risk, high impact)
2. Create auth service (medium risk, high impact)
3. Add Zod validation (low risk, medium impact)

### Do Later
1. Migrate i18n (high risk, medium impact)
2. Convert client components (low risk, medium impact)
3. Fix Admin model (medium risk, medium impact)

### Do Carefully
1. Prisma enum migration (high risk, must test)
2. Multi-tenant middleware (high risk, must test)

---

## Notes

- All changes should be committed with clear messages
- Run tests after each change
- Use feature flags for risky changes
- Document any manual steps needed
