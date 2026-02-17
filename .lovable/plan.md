

# Mobile Optimization for SkyServer

## Overview
After reviewing all pages at 375px mobile width, the site is already quite well-optimized -- responsive grids, hidden labels on tabs, stacked CTAs, etc. However, there are several areas that need improvement for a polished mobile experience.

## Issues Found and Fixes

### 1. Footer Layout (Critical)
**Problem:** The footer uses a single horizontal `flex-row` on `md:` breakpoint, but the nav links (Discord, Trustpilot, Help Center, Imprint, Terms of Service) are in a single row that wraps awkwardly on mobile.

**Fix in `src/components/layout/Footer.tsx`:**
- Stack the footer content vertically on mobile: logo on top, nav links in a centered wrapped grid, copyright at bottom
- Make the nav links wrap into a 2-column or centered flex-wrap layout on small screens
- Add proper spacing between rows

### 2. Help Center Tab Bar Overflow
**Problem:** With 7 game categories (now including "Server Management"), the tab bar wraps to 3 rows of icons on mobile, making it look crowded.

**Fix in `src/pages/Help.tsx`:**
- Make the TabsList horizontally scrollable on mobile using `overflow-x-auto` and `flex-nowrap` for small screens
- This keeps all tabs accessible in a single scrollable row

### 3. Admin Panel Tables (Horizontal Overflow)
**Problem:** The admin tables (Requests, Users) have many columns that don't fit on mobile screens, causing horizontal overflow without a scroll indicator.

**Fix in `src/components/admin/AdminRequests.tsx` and `src/components/admin/AdminUsers.tsx`:**
- Wrap tables in a container with `overflow-x-auto` to allow horizontal scrolling
- Add `min-w-[600px]` or similar to the table to ensure proper column widths

### 4. Admin Tabs Grid
**Problem:** `grid-cols-7` on the admin TabsList is very tight on mobile (7 icon-only tabs squished together).

**Fix in `src/pages/Admin.tsx`:**
- Change from `grid grid-cols-7` to a scrollable flex row on mobile, or use `grid-cols-4` on small screens with wrapping for the remaining tabs

### 5. Dashboard Welcome Header Text Size
**Problem:** The `text-3xl` heading on mobile is fine, but could be slightly smaller for very narrow screens.

**Fix in `src/pages/Dashboard.tsx`:**
- Change `text-3xl` to `text-2xl sm:text-3xl` for the welcome header

### 6. Stats Row in Hero Section
**Problem:** The 3-column stats grid (`grid-cols-3`) works but the `text-3xl` numbers are large for mobile.

**Fix in `src/components/landing/HeroSection.tsx`:**
- Change stat numbers from `text-3xl` to `text-2xl sm:text-3xl` for better mobile fit

### 7. Remove Unused App.css
**Problem:** `src/App.css` contains Vite boilerplate CSS that's not imported anywhere. Dead code.

**Fix:** Delete `src/App.css` to keep the project clean.

## Technical Details

### Files to modify:
1. **`src/components/layout/Footer.tsx`** -- Restructure to stack vertically on mobile with flex-wrap nav links
2. **`src/pages/Help.tsx`** -- Add `overflow-x-auto` and `flex-nowrap` to TabsList on mobile
3. **`src/pages/Admin.tsx`** -- Change TabsList from rigid grid-cols-7 to scrollable flex or responsive grid
4. **`src/pages/Dashboard.tsx`** -- Responsive text size on welcome header
5. **`src/components/landing/HeroSection.tsx`** -- Responsive stat number sizing
6. **`src/App.css`** -- Delete (unused file)

### Files NOT modified (already mobile-friendly):
- Header/hamburger menu -- already works well
- Game cards -- single column on mobile, looks great
- Login/Register pages -- centered card with `max-w-md`, already responsive
- FAQ section -- accordion works perfectly on mobile
- Server request modal -- dialog already responsive

