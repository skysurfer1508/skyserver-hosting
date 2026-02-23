

# Add Bonus Resources to Heavy-Duty Packages

## Overview
Update the Heavy-Duty RAM package to also include +100% CPU, and the Heavy-Duty CPU package to also include +2 GB RAM. This affects the webhook boost calculation and the frontend UI descriptions.

---

## Changes

### 1. `supabase/functions/stripe-webhook/index.ts` -- `calculateBoosts` function

Update the mapping so both heavy-duty prices grant combined boosts:

- `PRICE_HEAVY_RAM`: ramBoost = 10 * 1024 (10 GB), **cpuBoost += 100** (was 0)
- `PRICE_HEAVY_CPU`: cpuBoost = 800, **ramBoost += 2 * 1024** (was 0)

Since the loop processes items independently and the heavy-duty packages are mutually exclusive (user selects one), we can safely set both values per price ID using additive `+=` to avoid overwriting any per-unit slider values (though in practice heavy-duty is standalone).

### 2. `src/pages/ServerUpgrade.tsx` -- Heavy-Duty card descriptions and details

Update the two Heavy-Duty cards to show the bonus resources:

**Heavy-Duty RAM card:**
- Title stays: "10GB Heavy-Duty RAM"
- Add a subtitle/badge: "+ 100% CPU included"
- Description updated to mention the CPU bonus

**Heavy-Duty CPU card:**
- Title stays: "800% Heavy-Duty CPU"
- Add a subtitle/badge: "+ 2 GB RAM included"
- Description updated to mention the RAM bonus

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/stripe-webhook/index.ts` | Heavy-duty RAM also sets cpuBoost=100; heavy-duty CPU also sets ramBoost=2048 |
| `src/pages/ServerUpgrade.tsx` | Update card descriptions to show bonus resources |

No Stripe product changes needed -- the boost values are determined server-side by the webhook, not by Stripe pricing.

