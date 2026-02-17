

# Add "Support the Project" Button

## Overview
Add a visible "Support the Project" donation button linking to `paypal.me/skyserver1508` across the site -- in the header bar, the hamburger menu (mobile), and the footer.

## Changes

### 1. `src/config/constants.ts`
- Add `donate: 'https://paypal.me/skyserver1508'` to the `EXTERNAL_LINKS` object

### 2. `src/components/layout/Header.tsx`
- **Desktop header bar**: Add a "Support Us" button (using the `Heart` icon from lucide-react) next to the Discord and Game Panel buttons, styled with a warm accent (e.g., `hover:text-red-400`)
- **Mobile hamburger menu**: Add a "Support the Project" entry in the menu alongside the existing Discord and Game Panel mobile links, with `ExternalLink` indicator

### 3. `src/components/layout/Footer.tsx`
- Add a "Support Us" link in the footer nav alongside Discord, Help Center, Imprint, and Terms -- with a `Heart` icon and external link indicator

## Technical Details
- All three locations open the PayPal link in a new tab with `rel="noopener noreferrer"`
- Uses the `Heart` icon from `lucide-react` for consistent visual identity
- The URL is centralized in `constants.ts` so it can be updated in one place

