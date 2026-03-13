# Admin Model Normalization Report

## Current Problem

The schema has two redundant ways to represent the relationship between Users and Residences:

### Source 1: User.adminForResidenceId
```prisma
// In User model
adminForResidenceId String?
adminForResidence   Residence? @relation("AdminResidence", fields: [adminForResidenceId], references: [id])
```

### Source 2: Admin Model
```prisma
model Admin {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  residenceId String
  residence   Residence @relation(fields: [residenceId], references: [id])
  createdAt   DateTime @default(now())

  @@unique([userId, residenceId])
}
```

### Source 3: Residence.adminUsers (反向关系)
```prisma
// In Residence model
adminUsers User[] @relation("AdminResidence")
```

## Current Code Usage

### Places that use BOTH:
1. **`app/api/owner/residences/route.ts`**:
   - Creates User with `adminForResidenceId`
   - Also creates Admin record
   - On remove: updates User AND deletes Admin

2. **`app/api/owner/users/route.ts`**:
   - Creates Admin record after user creation
   - Updates adminForResidenceId

### Places that use ONLY adminForResidenceId:
1. **`app/api/owner/subscription-requests/route.ts`**:
   - Only sets `adminForResidenceId` (does NOT create Admin record)

2. **`app/api/owner/admins/route.ts`**:
   - Queries via `adminForResidence` on User

## Root Cause Analysis

The redundancy exists because:
1. Originally, Admin was a separate entity for multi-admin residences
2. Later, User.role was extended to include ADMIN with direct residence linkage
3. Both patterns are now used inconsistently

## Proposed Normalized Model

**New Source of Truth: User.adminForResidenceId**

The Admin model becomes deprecated but remains for backward compatibility. New code should only use User.adminForResidenceId.

### Schema Changes:

```prisma
// User model - KEEP (this is the source of truth)
adminForResidenceId String?
adminForResidence   Residence? @relation("AdminResidence", fields: [adminForResidenceId], references: [id])

// Admin model - DEPRECATE (keep for migration, don't use in new code)
model Admin {
  // DEPRECATED - Use User.adminForResidenceId instead
  // This table will no longer be maintained
}

// Residence model - KEEP but simplify
adminUsers User[] @relation("AdminResidence")  // Keep for backward compat
```

## Migration Strategy

### Phase 1: Single Source of Truth (Recommended)
- Keep Admin table but create/sync it with User.adminForResidenceId
- Use User.adminForResidenceId as primary (source of truth)
- All code paths MUST create both User + Admin for consistency
- This ensures backward compatibility with code expecting Admin table

### Phase 2: Remove Admin Table (Future - Breaking Change)
- Requires migration of existing data
- Delete Admin table entirely
- Remove all prisma.admin.create/delete calls

## Current Decision

**Implementing Phase 1** - Making both code paths consistent.

### Changes:
1. Make Admin table optional - don't require it for admin access
2. Use User.adminForResidenceId as the authoritative source
3. Keep Admin table for backward compatibility but don't create it in new code
4. Document that adminForResidenceId is the source of truth

## Code After Refactor

### Access Logic:
```typescript
// Get admin's residence - USE THIS
const adminResidenceId = user.adminForResidenceId

// DON'T USE - Deprecated
const admin = await prisma.admin.findFirst({ where: { userId: user.id } })
```

### Create Admin User:
```typescript
// Correct way
await prisma.user.create({
  data: {
    email,
    name,
    role: 'ADMIN',
    adminForResidenceId: residenceId,  // This is the source of truth
    organizationId: orgId
  }
})

// DON'T DO - Creates redundant record
await prisma.admin.create({
  data: { userId: newUser.id, residenceId }
})
```

## Files Affected

| File | Current Behavior | After Fix |
|------|------------------|-----------|
| subscription-requests | Only sets adminForResidenceId | Add Admin.create for consistency |
| owner/residences | Creates both | Use only adminForResidenceId |
| owner/users | Creates both | Use only adminForResidenceId |
| owner/admins | Reads via adminForResidence | Keep as-is (works) |

## Risk Assessment

- **Low Risk**: Keeping Admin table doesn't break existing code
- **Medium Risk**: Changing create patterns could cause issues if other code depends on Admin table
- **Recommendation**: Implement gradual change - stop creating Admin records in new code, but don't delete existing ones

### Implementation Completed:
- ✅ subscription-requests/route.ts: Now creates Admin record for backward compatibility
- ✅ owner/residences/route.ts: Already creates both (User + Admin)
- ✅ owner/users/route.ts: Already creates both (User + Admin)

All admin creation paths now create BOTH User with adminForResidenceId AND Admin record.

### Access Logic (Source of Truth):
```typescript
// PRIMARY WAY - Use this
const adminResidenceId = user.adminForResidenceId

// Alternative (for backward compatibility)
const admin = await prisma.admin.findFirst({ where: { userId: user.id } })
```

## Risk Assessment

- **Low Risk**: All code paths now consistently create both records
- **Recommendation**: Use User.adminForResidenceId as the primary source; Admin table is for backward compatibility only

## Remaining Compromise

The Admin table still exists as redundant data. Future migration (Phase 2) can remove it entirely once:
1. All code is updated to use only User.adminForResidenceId
2. All existing Admin records are migrated to User records
3. The Admin table is dropped from schema
