# Production Database Recommendations

## Overview

This document outlines database optimizations for moving from SQLite (development) to PostgreSQL (production).

## Current State

- **Development**: SQLite (file-based, no server needed)
- **Production**: PostgreSQL recommended for:
  - Better concurrency
  - Full-text search
  - Richer index support
  - Better query planning

## Key Differences: SQLite vs PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Indexes | Limited | Full support |
| Query Planning | Basic | Advanced |
| Concurrency | File-level locks | Row-level locks |
| JSON Support | Basic | Advanced |
| Full-text Search | Extension needed | Built-in |
| Partitioning | Not supported | Supported |

## Index Recommendations

### Indexes for SQLite (Limited)

SQLite has limited index support but still benefits from:

```prisma
// Add to schema.prisma where supported
// Note: SQLite has limited compound index support
model User {
  // ... fields
  @@index([organizationId])
  @@index([role])
  @@index([adminForResidenceId])
}

model Residence {
  // ... fields
  @@index([organizationId])
  @@index([status])
}

model Apartment {
  // ... fields
  @@index([residenceId])
  @@index([status])
  @@index([residenceId, number]) // compound
}

model Payment {
  // ... fields
  @@index([status])
  @@index([apartmentId])
  @@index([chargeId])
  @@index([dueDate])
}

model Charge {
  // ... fields
  @@index([residenceId])
  @@index([apartmentId])
  @@index([dueDate])
  @@index([year, month]) // compound
}

model SubscriptionRequest {
  // ... fields
  @@index([status])
  @@index([createdAt])
}
```

### Indexes for PostgreSQL (Recommended for Production)

PostgreSQL supports more powerful indexing:

```prisma
// PostgreSQL-specific indexes
model User {
  // ... fields
  @@index([organizationId, role]) // Compound for filtering
  @@index([email]) // Already @unique but explicit
  @@index([adminForResidenceId])
  @@index([createdAt])
}

model Residence {
  // ... fields
  @@index([organizationId, status])
  @@index([city])
  @@index([createdAt])
}

model Apartment {
  // ... fields
  @@index([residenceId, status]) // For occupied/vacant queries
  @@index([residenceId, number]) // Already @@unique
}

model Payment {
  // ... fields
  @@index([status, paidDate]) // For revenue reports
  @@index([apartmentId, dueDate])
  @@index([subscriptionId])
  // GIST index for full-text (if needed)
}

model Charge {
  // ... fields
  @@index([residenceId, year, month]) // For monthly reports
  @@index([apartmentId, dueDate])
  @@index([status]) // If adding status field
}

model SubscriptionRequest {
  // ... fields
  @@index([status, createdAt]) // For pending requests
  @@index([email])
}

model MaintenanceRequest {
  // ... fields
  @@index([residenceId, status])
  @@index([apartmentId, status])
  @@index([createdAt])
}

model Announcement {
  // ... fields
  @@index([residenceId, isActive, startDate])
}
```

## Query Optimizations

### Current Issues Found

1. **Dashboard Route** - Fetches all data, then filters in JS
2. **Reports Route** - N+1 queries in loops
3. **No select() optimization** - Fetching full models

### Recommended Patterns

```typescript
// BAD: Fetch all, filter in JS
const allPayments = await prisma.payment.findMany({ where: { status: 'PAID' } })
const total = allPayments.reduce((sum, p) => sum + p.amount, 0)

// GOOD: Aggregate in database
const result = await prisma.payment.aggregate({
  where: { status: 'PAID' },
  _sum: { amount: true }
})
const total = result._sum.amount || 0

// BAD: N+1 in loop
const items = await prisma.item.findMany()
for (const item of items) {
  const count = await prisma.subItem.count({ where: { itemId: item.id } })
}

// GOOD: Single query with _count
const items = await prisma.item.findMany({
  include: { _count: { select: { subItems: true } } }
})
```

## Configuration for Production

### PostgreSQL Connection Pool

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"] // For connection pooling
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// In production, use PgBouncer or similar for connection pooling
```

### Recommended PostgreSQL Settings

```sql
-- postgresql.conf recommendations
shared_buffers = 256MB  -- 25% of RAM
effective_cache_size = 768MB  -- 75% of RAM
work_mem = 16MB
maintenance_work_mem = 128MB
random_page_cost = 1.1  -- For SSD
effective_io_concurrency = 200

-- Enable query planner hints
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
```

## Migration Checklist

- [ ] Run `npx prisma generate` with PostgreSQL provider
- [ ] Run `npx prisma db push` or `migrate`
- [ ] Add indexes to schema
- [ ] Review slow queries with `EXPLAIN ANALYZE`
- [ ] Set up connection pooling (PgBouncer)
- [ ] Configure proper backup strategy

## Local Development (Keep SQLite)

These should stay SQLite-only:
- Development workflow
- Testing/CI
- Quick prototyping
- Single-user scenarios

For local development, you can keep using SQLite. The optimizations in this document are primarily for PostgreSQL production deployment.
