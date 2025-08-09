# Admin Dashboard Data Consistency Fix

## Issue Identified
The Admin Dashboard overview page was showing different data counts than the respective Properties and Users Management pages. This was causing confusion and inconsistency in the admin interface.

## Root Causes Found

### 1. User Count Discrepancy
- **Dashboard API**: Was counting ALL users including admin users
- **Users Page API**: Excludes admin users with `role: { notIn: ['ADMIN', 'SUPER_ADMIN'] }`
- **Fix**: Updated dashboard stats to exclude admin users for consistency

### 2. Data Structure Inconsistency (Properties)
- **Properties API**: Returned `{ properties, total, page, limit }`
- **Properties Page**: Expected `{ data, pagination: { total } }`
- **Fix**: Updated API to return consistent data structure

### 3. Import Statement Issues
- Both admin APIs were using incorrect import paths
- **Fix**: Updated imports to use correct paths:
  - `@/lib/authOptions` (not `@/lib/auth`)
  - `prisma` default import (not named export)

### 4. Enhanced Query Parameter Support
- **Properties API**: Added support for `moderationStatus` and `isActive` filters
- **Users API**: Added support for `isSuspended` filter and improved verification status mapping

### 5. Verification Status Mapping
- Fixed the mapping between database fields and frontend display values
- Properly mapped `isVerified` boolean and `verificationLevel` enum to frontend status

## Changes Made

### 1. Dashboard Stats API (`/api/admin/dashboard/stats`)
```typescript
// Before: prisma.user.count()
// After: 
prisma.user.count({
  where: { role: { notIn: ['ADMIN', 'SUPER_ADMIN'] } }
})

// Also updated recent users query to exclude admin users
```

### 2. Properties API (`/api/admin/properties`)
```typescript
// Before:
return NextResponse.json({
  success: true,
  properties,
  total,
  page,
  limit,
});

// After:
return NextResponse.json({
  success: true,
  data: properties,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
});
```

### 3. Enhanced Filtering Support
- Added support for moderation status filtering in properties
- Added support for active/inactive filtering in properties
- Improved verification status mapping in users API
- Added suspension status filtering in users API

### 4. Import Fixes
- Updated import statements in both APIs to use correct paths
- Fixed Prisma import to use default export

## Testing Recommendations

1. **Verify Dashboard Stats**: Check that total users and properties counts match between dashboard and individual pages
2. **Test Filtering**: Ensure filters work correctly on both properties and users pages
3. **Check Admin User Exclusion**: Verify that admin users are consistently excluded from counts
4. **Validate Data Structure**: Ensure properties page correctly receives and displays data

## Expected Results

After these fixes:
- Dashboard overview stats should match the totals shown on Properties and Users management pages
- User count should exclude admin users consistently across all pages
- Data filtering should work correctly on all admin pages
- No import or structural errors should occur

## Files Modified

1. `src/app/api/admin/dashboard/stats/route.ts`
2. `src/app/api/admin/properties/route.ts`
3. `src/app/api/admin/users/route.ts`

The admin dashboard should now display consistent and accurate data across all pages.
