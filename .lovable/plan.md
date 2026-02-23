

# New Pricing Logic and UI for Server Upgrades

## Overview
Revamp the upgrade page with tiered discount pricing for both RAM and CPU, plus fixed "Heavy-Duty" bundle packages. Users will see two clear options: a custom slider with dynamic pricing (including a 10% discount badge at 7+ units) and a prominent pre-built bundle card.

---

## 1. Create New Stripe Products and Prices

Using the Stripe tools, create:

- **Heavy-Duty RAM Package**: A new recurring product "10GB Heavy-Duty RAM" at **13.00 CHF/month**
- **Heavy-Duty CPU Package**: A new recurring product "800% Heavy-Duty CPU" at **10.00 CHF/month** (equivalent discount to RAM)
- **10% Off Coupon**: A Stripe coupon named "Bulk Upgrade 10% Off" with `percent_off: 10`, `duration: "forever"` -- applied automatically at checkout when slider is at 7+ units

---

## 2. Update `src/config/constants.ts`

Add the new Stripe price IDs for the heavy-duty packages and the coupon ID:

```
STRIPE_PRICES = {
  ram: '...',
  cpu: '...',
  heavyDutyRam: 'price_xxx',   // 10GB @ 13.00 CHF
  heavyDutyCpu: 'price_yyy',   // 800% @ 10.00 CHF
}
STRIPE_COUPON_BULK = 'coupon_id'
```

---

## 3. Redesign `src/pages/ServerUpgrade.tsx`

### New State
- `selectedPackage`: `'custom' | 'heavy-duty-ram' | 'heavy-duty-cpu' | null` -- tracks which option the user picked

### Pricing Logic (frontend display only)
```
PRICE_PER_UNIT = 1.50
DISCOUNT_THRESHOLD = 6

For quantity <= 6:  price = quantity * 1.50
For quantity > 6:   price = (quantity * 1.50) * 0.90
                    originalPrice = quantity * 1.50  (shown crossed out)
```

### UI Layout (replaces current "Add Extra Resources" card)

**Section: "Choose Your Upgrade"**

Two sub-sections side by side (stacked on mobile):

**Option A -- Custom Slider Card:**
- RAM slider: 1-12 GB (changed from 0-8)
- CPU slider: 1-8 units (100%-800%)
- Real-time price display:
  - If <= 6 units: show price normally (e.g., "9.00 CHF")
  - If > 6 units: show ~~original price~~ crossed out + discounted price + "10% Off!" badge
- Total at bottom combining RAM + CPU

**Option B -- Heavy-Duty Bundle Cards:**
- **RAM Card** (highlighted with border-primary glow):
  - Title: "10GB Heavy-Duty RAM"
  - Price: "13.00 CHF / month"
  - Description: "Best value for large Satisfactory factories or busy Minecraft networks."
  - "Select Package" button
- **CPU Card** (same styling):
  - Title: "800% Heavy-Duty CPU"  
  - Price: "10.00 CHF / month"
  - Description: "Maximum processing power for modded servers and heavy workloads."
  - "Select Package" button

When a Heavy-Duty package is selected, the card gets a checkmark and the checkout button activates.

---

## 4. Update `supabase/functions/create-checkout-session/index.ts`

Accept a new optional field in the request body: `heavyDutyPackage: 'ram' | 'cpu' | null` and `applyBulkDiscount: boolean`.

- If `heavyDutyPackage` is set, use the fixed heavy-duty price ID (quantity 1) instead of per-unit prices.
- If `applyBulkDiscount` is true (slider quantity > 6 for either resource), attach the Stripe coupon to the checkout session via `discounts: [{ coupon: COUPON_ID }]`.
- Otherwise, keep existing per-unit pricing logic.

---

## 5. Update `supabase/functions/stripe-webhook/index.ts`

Add the new heavy-duty price IDs to the `calculateBoosts` function:
- `PRICE_HEAVY_RAM` maps to 10 * 1024 MB RAM boost
- `PRICE_HEAVY_CPU` maps to 800% CPU boost

This ensures the webhook correctly processes boosts regardless of whether the user bought via slider or bundle.

---

## 6. Files Changed Summary

| File | Change |
|------|--------|
| `src/config/constants.ts` | Add heavy-duty price IDs and coupon ID |
| `src/pages/ServerUpgrade.tsx` | New UI with discount logic, heavy-duty cards, updated checkout call |
| `supabase/functions/create-checkout-session/index.ts` | Handle heavy-duty packages and bulk discount coupon |
| `supabase/functions/stripe-webhook/index.ts` | Recognize new heavy-duty price IDs in boost calculation |

No database changes required.

