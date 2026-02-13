

# Add Trustpilot Widget to Footer

## Overview
Embed a Trustpilot TrustBox "Mini" widget in the footer, showing your star rating and review count alongside the existing links.

## How It Works
Trustpilot widgets load via a script (`https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js`) and render inside a `div` with specific data attributes including your Business Unit ID. No API keys or secrets are needed -- everything is public.

## What You Need to Provide
Your **Trustpilot Business Unit ID** -- find it in your Trustpilot Business dashboard URL or in any TrustBox widget code snippet. It looks like a long alphanumeric string (e.g., `5f1234abcdef567890`).

## Changes

### 1. `index.html`
Add the Trustpilot bootstrap script in the `<head>`:
```text
<script src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" async></script>
```

### 2. `src/components/layout/Footer.tsx`
Add a Trustpilot TrustBox `div` in the footer layout, positioned between the logo and the nav links. The widget uses a "Mini" template (`5419b6a8b0d04a076446a9ad`) which shows a compact star rating with review count -- fitting well in a footer.

The Business Unit ID will be stored as a constant in `src/config/constants.ts` for easy updates.

### 3. `src/config/constants.ts`
Add the Trustpilot Business Unit ID constant:
```text
export const TRUSTPILOT_BUSINESS_UNIT_ID = '<your-id-here>';
```

## Files Changed

| File | Change |
|------|--------|
| `index.html` | Add Trustpilot bootstrap script |
| `src/config/constants.ts` | Add Trustpilot Business Unit ID constant |
| `src/components/layout/Footer.tsx` | Add TrustBox widget div |

