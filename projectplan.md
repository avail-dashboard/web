# Project Plan: Create Consistent 80% Container Width

## Problem Analysis
Currently using inconsistent container classes across pages:
- Header uses `w-4/5 mx-auto px-4` 
- Homepage uses `container mx-auto px-4 py-8`
- Other pages likely use various container approaches
- No single source of truth for layout consistency

## Goal
Create a unified 80% width container system across all pages for consistent UI alignment.

## Single Source of Truth Approach

### Todo Items
- [ ] Create custom container class in globals.css for 80% width
- [ ] Update Header component to use consistent container class
- [ ] Update homepage to use consistent container class  
- [ ] Update all other pages (/blocks, /extrinsics, /validators, /accounts, /data-submissions) to use consistent container
- [ ] Test all pages to ensure consistent 80% width alignment

## Implementation Plan

### Step 1: Create CSS Single Source of Truth
Add to `globals.css`:
```css
.app-container {
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}
```

### Step 2: Update Components Systematically
1. **Header component** - Replace `w-4/5 mx-auto px-4` with `app-container`
2. **Homepage** - Replace `container mx-auto px-4 py-8` with `app-container py-8`
3. **All page files** - Search and replace inconsistent containers

### Step 3: Verification
- Test homepage alignment
- Test /blocks page alignment  
- Test /extrinsics page alignment
- Test all other pages
- Verify header aligns with all page content

## Benefits
- Single source of truth for container width
- Easy to change width site-wide (just update CSS)
- Consistent user experience across all pages
- Cleaner, more maintainable code

## Files to Update
- `src/app/globals.css` - Add app-container class
- `src/components/layout/Header.tsx` - Use app-container
- `src/app/page.tsx` - Use app-container
- `src/app/blocks/page.tsx` - Use app-container
- `src/app/extrinsics/page.tsx` - Use app-container  
- `src/app/data-submissions/page.tsx` - Use app-container
- `src/app/accounts/[address]/page.tsx` - Use app-container
- `src/app/blocks/[id]/page.tsx` - Use app-container
- `src/app/extrinsics/[hash]/page.tsx` - Use app-container