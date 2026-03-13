# Technical Debt Report - Darency SaaS

## Generated: 2026-03-12

## Executive Summary

This document tracks technical debt identified during the final hardening pass. The codebase is **production-ready** for core features with some known limitations documented below.

---

## ✅ Production Ready

### Core Features
- User authentication (NextAuth)
- Role-based access control (OWNER, ADMIN, RESIDENT)
- Multi-tenant architecture (Organizations → Residences → Apartments)
- Subscription management
- Payment tracking
- Charge management
- Dashboard and reporting

### Technical Infrastructure
- Prisma ORM with SQLite (dev) / PostgreSQL (prod ready)
- Zod validation layer (API routes)
- i18n support (fr, ar, en)
- TypeScript throughout

---

## 🔶 Known Technical Debt

### 1. Inline Translations (Medium Priority)
**Location:** 5 pages still use inline translation objects
- `app/[locale]/admin/finances/page.tsx`
- `app/[locale]/owner/residences/page.tsx`
- `app/[locale]/owner/reports/page.tsx`
- `app/[locale]/owner/settings/page.tsx`
- `app/[locale]/owner/users/page.tsx`

**Impact:** Duplication, inconsistent translation patterns

**Recommendation:** Migrate to centralized `lib/i18n/dictionary.ts` using the existing hook pattern

---

### 2. Query Performance (Medium Priority)
**Location:** Dashboard and Reports routes

**Issues:**
- Fetching all records, filtering in JavaScript instead of database
- N+1 query patterns in loops

**Example:**
```typescript
// Current (inefficient)
const allPayments = await prisma.payment.findMany({ where: { status: 'PAID' } })
const total = allPayments.reduce((sum, p) => sum + p.amount, 0)

// Better (database aggregation)
const result = await prisma.payment.aggregate({
  where: { status: 'PAID' },
  _sum: { amount: true }
})
```

**Recommendation:** Refactor to use Prisma aggregations; indexes already added

---

### 3. React Hook Dependencies (Low Priority)
**Location:**
- `app/[locale]/owner/activity-logs/page.tsx:84`
- `app/[locale]/owner/subscriptions/page.tsx:94`

**Issue:** Missing useEffect dependencies

**Recommendation:** Add ESLint ignore comments or restructure hooks

---

### 4. Image Optimization (Low Priority)
**Location:** `components/subscription-modal.tsx:637`

**Issue:** Using `<img>` instead of Next.js `<Image />`

**Recommendation:** Replace with Next.js Image component

---

### 5. Environment Variables (High Priority for Production)
**Missing:**
- `NEXTAUTH_SECRET` - Required for production
- `NEXTAUTH_URL` - Required for production
- `DATABASE_URL` - Already configured

**Recommendation:** Ensure these are set in production environment

---

## 📋 Remaining Work

### High Priority
- [ ] Set `NEXTAUTH_SECRET` in production
- [ ] Set `NEXTAUTH_URL` in production
- [ ] Migrate database from SQLite to PostgreSQL

### Medium Priority
- [ ] Migrate 5 pages from inline translations to centralized dictionary
- [ ] Refactor dashboard/reports routes to use database aggregations
- [ ] Add error boundaries for better UX

### Low Priority
- [ ] Fix React useEffect dependencies
- [ ] Replace `<img>` with Next.js `<Image />`
- [ ] Add loading skeletons for better perceived performance

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App                              │
├─────────────────────────────────────────────────────────────┤
│  Pages (App Router)                                          │
│  ├── [locale]/owner/*    → Dashboard, Reports, Settings    │
│  ├── [locale]/admin/*    → Residences, Finances             │
│  └── [locale]/*          → Public pages                     │
├─────────────────────────────────────────────────────────────┤
│  API Routes (38 endpoints)                                    │
│  ├── /api/owner/*      → Owner-only operations             │
│  ├── /api/admin/*       → Admin operations                  │
│  ├── /api/resident/*   → Resident operations               │
│  └── /api/public/*     → Public endpoints                   │
├─────────────────────────────────────────────────────────────┤
│  Libraries                                                   │
│  ├── lib/auth.ts        → NextAuth configuration            │
│  ├── lib/prisma.ts     → Database client                    │
│  ├── lib/i18n/         → Internationalization               │
│  └── lib/validations/  → Zod schemas                       │
├─────────────────────────────────────────────────────────────┤
│  Database (Prisma)                                           │
│  └── SQLite (dev) / PostgreSQL (prod)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

Before production deployment, verify:

- [ ] `NEXTAUTH_SECRET` environment variable set
- [ ] `NEXTAUTH_URL` environment variable set  
- [ ] Database migrated to PostgreSQL
- [ ] Build completes without errors
- [ ] All API routes return correct status codes
- [ ] Authentication flow works for all 3 roles
- [ ] Subscription approval flow creates correct records
- [ ] Payment/Charge creation works
- [ ] i18n language switching works

---

## Dependencies

### Production Dependencies
- next: ^14.x
- @prisma/client: ^5.x
- next-auth: ^4.x
- @heroicons/react
- lucide-react
- tailwindcss
- zod: ^3.x

### Development Dependencies
- prisma: ^5.x
- typescript
- eslint
- tailwindcss

---

## Conclusion

The codebase is **feature-complete and stable**. The main blockers for production are environment configuration and database migration. Technical debt is manageable and can be addressed iteratively post-launch.
