# Technical Audit Report: Darency SaaS Project

**Project:** Next.js 14 + TypeScript + Prisma + NextAuth  
**Date:** 2026-03-09  
**Audit Scope:** Full Stack Analysis

---

## 📊 Executive Summary

This is a **multi-tenant property management SaaS** application with three user roles:
- **OWNER**: Platform super-admin (can manage multiple residences/organizations)
- **ADMIN**: Residence manager/syndic (manages single residence)
- **RESIDENT**: Apartment occupant (views own data)

### Overall Assessment: **6/10** - Functional but with significant gaps

---

## 🚨 CRITICAL ISSUES

### 1. PrismaClient Used in Client Component
**Location:** `/app/[locale]/admin/residents/page.tsx:10`
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```
**Impact:** 
- Exposes database connection to client-side
- Security vulnerability - exposes database schema
- Will cause runtime errors in browser

**Recommendation:** Remove PrismaClient from client components; use API routes only.

---

### 2. Hardcoded Mock Data in Production Code
**Location:** `/app/[locale]/admin/page.tsx:330-346`
```typescript
<p className="text-2xl font-bold text-success mt-1">{formatCurrency(28500)}</p>  // Hardcoded!
<p className="text-2xl font-bold text-warning mt-1">{formatCurrency(4500)}</p>   // Hardcoded!
```
**Impact:**
- Financial data is fake/mocked
- User sees incorrect information
- Destroys trust in application

**Recommendation:** Fetch all data from API or remove display if unavailable.

---

### 3. Password Hashing Missing in User Creation
**Location:** `/app/api/owner/users/route.ts:116`
```typescript
password: password || 'TempPassword123!', // Temporary password - should be changed
```
**Impact:**
- Passwords stored in plain text
- Security vulnerability
- Default password for all users

**Recommendation:** Always hash passwords with bcrypt before storing.

---

### 4. Weak Default Auth Secret
**Location:** `/lib/auth.ts:115`
```typescript
secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production'
```
**Impact:** 
- Falls back to insecure default in production
- Session tokens can be forged

**Recommendation:** Fail startup if NEXTAUTH_SECRET is not set in production.

---

## 🔴 BACKEND GAPS

### Missing API Routes

| Page | API Endpoint | Status |
|------|-------------|--------|
| Admin Announcements | `/api/admin/announcements` | ❌ Missing |
| Admin Documents | `/api/admin/documents` | ❌ Missing |
| Admin Settings | `/api/admin/settings` | ❌ Missing |
| Owner Expenses | `/api/owner/expenses` | ❌ Missing |
| Owner Payments | `/api/owner/payments` | ❌ Missing |
| Owner Apartments | `/api/owner/apartments` | ❌ Missing |
| Resident Announcements | `/api/resident/announcements` | ❌ Missing |
| Resident Documents | `/api/resident/documents` | ❌ Missing |
| Resident Profile | `/api/resident/profile` | ❌ Missing |

### Existing Routes Missing HTTP Methods

| Route | GET | POST | PATCH | DELETE |
|-------|-----|------|-------|--------|
| `/api/admin/apartments` | ✅ | ✅ | ❌ | ❌ |
| `/api/admin/charges` | ❌ | ❌ | ❌ | ❌ (uses `/api/charges`) |
| `/api/admin/expenses` | ✅ | ✅ | ❌ | ✅ |
| `/api/admin/payments` | ✅ | ✅ | ❌ | ❌ |
| `/api/admin/maintenance` | ✅ | ❌ | ✅ | ❌ |
| `/api/charges` | ✅ | ✅ | ❌ | ❌ |
| `/api/owner/residences` | ✅ | ✅ | ✅ | ❌ |
| `/api/owner/users` | ✅ | ✅ | ✅ | ✅ |
| `/api/owner/dashboard` | ✅ | ❌ | ❌ | ❌ |

---

## 🟡 FRONTEND GAPS

### Pages with No Real Data Connection

| Page | Issue |
|------|-------|
| `/admin/page.tsx` | Hardcoded financial data (28500, 4500, 86%, 342000) |
| `/admin/announcements/page.tsx` | Empty state only - no CRUD |
| `/admin/documents/page.tsx` | Empty state only - no CRUD |
| `/admin/settings/page.tsx` | Need to verify |
| `/resident/charges/page.tsx` | Empty state only - no data fetching |
| `/resident/announcements/page.tsx` | Need to verify |
| `/resident/documents/page.tsx` | Need to verify |
| `/resident/profile/page.tsx` | Need to verify |
| `/owner/plan/page.tsx` | Need to verify |
| `/owner/abonnement/page.tsx` | Need to verify |
| `/owner/abonnements/page.tsx` | Need to verify |

### Frontend Code Issues

1. **Duplicate Prisma Instances**: Each API route creates its own PrismaClient
   ```typescript
   // Multiple files have this pattern:
   const prisma = new PrismaClient()
   ```
   Should use the singleton from `/lib/prisma.ts`

2. **Inline Translations**: Hardcoded translation objects in every page instead of centralized i18n

3. **No Error Boundaries**: Missing error handling for failed API calls

4. **Loading States Inconsistent**: Some pages show spinners, others don't

---

## 🗄️ DATABASE ISSUES

### 1. SQLite for Production
**Location:** `prisma/schema.prisma:6`
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```
**Issues:**
- Not suitable for production
- No concurrent writes
- Limited scaling
- File-based (data loss risk)

**Recommendation:** Switch to PostgreSQL for production.

---

### 2. Database Schema Issues

| Issue | Location | Description |
|-------|----------|-------------|
| No indexes | All models | Performance issues at scale |
| No cascade deletes | User/Apartment | Orphaned records possible |
| No validations | All models | Invalid data can be stored |
| Missing relations | User->Admin | Redundant relationship |
| No soft deletes | All models | Permanent data loss |

---

## 🔐 AUTH & RBAC ISSUES

### 1. Inconsistent Role Checks
**Location:** Middleware vs API routes

Middleware uses loose matching:
```typescript
// middleware.ts:85
const hasAccess = allowedRoutes.some(route => 
  pathname.startsWith(`/${route}`) || pathname.includes(route)
)
```

API routes use strict checks:
```typescript
// All API routes
if (!session || session.user.role !== 'ADMIN')
```

**Issue:** Path traversal could bypass middleware but not API (security theater).

---

### 2. Missing Security Features

| Feature | Status |
|---------|--------|
| Rate Limiting | ❌ Missing |
| Account Lockout | ❌ Missing |
| Password Reset | ❌ Missing |
| 2FA/MFA | ❌ Missing |
| Session Expiry | ⚠️ 30 days (too long) |
| CSRF Protection | ❌ Missing |

---

## ⚠️ SECURITY ISSUES

### 1. No Input Validation
Most API routes lack input sanitization:
```typescript
// No validation in owner/users POST
const { name, email, phone, role, residenceId, apartmentId, password } = body
// Should validate email format, password strength, etc.
```

### 2. Information Disclosure
Error messages may reveal sensitive info:
```typescript
catch (error) {
  console.error('Error fetching apartments:', error)  // Logs full stack
  return NextResponse.json({ error: 'Failed to fetch apartments' }, { status: 500 })
}
```

### 3. Missing HTTPS Enforcement
No redirect from HTTP to HTTPS in middleware.

---

## 🏭 PRODUCTION READINESS

### Environment & Config

| Item | Status | Notes |
|------|--------|-------|
| Environment Variables | ⚠️ Partial | NEXTAUTH_SECRET fallback is weak |
| TypeScript Strict | ❓ Unknown | No tsconfig review |
| ESLint | ✅ Configured | |
| Prettier | ❓ Unknown | Not in package.json |

### Missing Production Features

| Feature | Priority | Status |
|---------|----------|--------|
| Error Tracking (Sentry) | High | ❌ Missing |
| Analytics | Medium | ❌ Missing |
| Health Checks | Medium | ❌ Missing |
| API Rate Limiting | High | ❌ Missing |
| Backup Strategy | High | ❌ Missing |
| CI/CD Pipeline | High | ❌ Missing |
| Containerization | Medium | ❌ Missing |

### Performance Concerns

1. **N+1 Query Issues**: Dashboard APIs fetch data inefficiently
   ```typescript
   // Example: owner/dashboard/route.ts makes multiple queries per residence
   for (const residence of residences) {
     const apartments = await prisma.apartment.findMany(...)
     const charges = await prisma.charge.findMany(...)
     // More queries...
   }
   ```

2. **No Pagination**: All list endpoints return all records

3. **No Caching**: Every request hits database

---

## ✅ WHAT'S WORKING WELL

1. **Multi-tenancy Architecture**: Good separation via organizationId
2. **Role-based Access**: Correctly implemented in API routes
3. **Admin Residence Scoping**: ADMIN users properly scoped to single residence
4. **Code Organization**: Clear folder structure
5. **UI Components**: Reusable component library (shadcn-like)

---

## 📋 RECOMMENDED ROADMAP

### Phase 1: Critical Fixes (Week 1-2)
- [ ] Remove PrismaClient from client components
- [ ] Fix hardcoded values in admin dashboard
- [ ] Add password hashing to user creation
- [ ] Add NEXTAUTH_SECRET validation
- [ ] Switch to PostgreSQL

### Phase 2: Complete Backend APIs (Week 3-4)
- [ ] Create all missing API routes
- [ ] Add input validation (Zod)
- [ ] Add pagination to list endpoints
- [ ] Fix N+1 queries
- [ ] Add rate limiting

### Phase 3: Frontend Data Connection (Week 5-6)
- [ ] Connect all empty-state pages to real data
- [ ] Add proper error handling
- [ ] Implement loading states consistently
- [ ] Centralize translations

### Phase 4: Security Hardening (Week 7-8)
- [ ] Add password reset flow
- [ ] Implement 2FA
- [ ] Add CSRF protection
- [ ] Implement HTTPS redirect
- [ ] Add security headers

### Phase 5: Production Readiness (Week 9-10)
- [ ] Set up error tracking (Sentry)
- [ ] Set up CI/CD pipeline
- [ ] Add health check endpoints
- [ ] Document deployment process
- [ ] Add monitoring/alerting

---

## 📁 FILE STRUCTURE

```
darency-saas/
├── app/
│   ├── [locale]/
│   │   ├── admin/          # 10 pages
│   │   ├── owner/          # 8 pages
│   │   ├── resident/      # 7 pages
│   │   └── login/
│   └── api/
│       ├── admin/          # 5 routes
│       ├── owner/          # 7 routes
│       ├── resident/       # 1 route
│       ├── charges/
│       ├── residents/
│       └── auth/
├── components/
│   ├── ui/                 # 6 components
│   ├── dashboard/          # 9 components
│   ├── layout/
│   └── providers/
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── utils.ts
└── prisma/
    └── schema.prisma       # 14 models
```

---

## 📊 STATISTICS

| Metric | Count |
|--------|-------|
| Total Pages | 27 |
| Pages with Real Data | ~12 |
| Missing Backend APIs | ~12 |
| Critical Security Issues | 4 |
| Hardcoded Values | 4+ |

---

*Report generated by OpenHands Technical Audit*
