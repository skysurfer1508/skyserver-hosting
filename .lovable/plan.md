

# Resource Upgrading Billing System with Stripe Subscriptions

## Overview

Add a monthly subscription system where users can purchase extra RAM and CPU for their game servers. Instead of auto-syncing to Pterodactyl, the admin will see boost purchases directly in their admin panel and apply them manually.

## Stripe Products (Already Created)

- **Extra RAM (1GB):** `price_1Sz653GTSSIIOUojGFw4LyEm` -- 1.50 CHF/month
- **Extra CPU (100%):** `price_1Sz65FGTSSIIOUoje6QD4l9Q` -- 1.50 CHF/month

---

## Step 1: Database Schema Changes

**`server_requests` table -- add 3 columns:**
- `cpu_boost` (integer, default 0) -- extra CPU percentage purchased
- `ram_boost` (integer, default 0) -- extra RAM in MB purchased
- `stripe_subscription_id` (text, nullable) -- tracks the active Stripe subscription

**`profiles` table -- add 1 column:**
- `stripe_customer_id` (text, nullable, unique) -- links user to their Stripe customer

---

## Step 2: Edge Functions (3 new functions)

### Function 1: `create-checkout-session`
- Authenticates user via JWT
- Looks up or creates a Stripe customer (saves `stripe_customer_id` to profiles)
- Creates a Stripe Checkout Session in `subscription` mode with:
  - RAM line item: `price_1Sz653GTSSIIOUojGFw4LyEm` x quantity (only if > 0)
  - CPU line item: `price_1Sz65FGTSSIIOUoje6QD4l9Q` x quantity (only if > 0)
  - Metadata: `{ serverId, userId }`
- Returns the checkout URL

### Function 2: `stripe-webhook`
- Receives Stripe webhook events (`verify_jwt = false`)
- Handles these events:
  - `checkout.session.completed`: reads metadata, retrieves subscription line items, calculates `ram_boost` (quantity x 1024 MB) and `cpu_boost` (quantity x 100%), updates `server_requests` table
  - `customer.subscription.deleted`: resets boosts to 0, clears `stripe_subscription_id`
- **No Pterodactyl sync** -- the admin sees the updated boost values in their admin panel and applies changes manually

### Function 3: `customer-portal`
- Authenticates user, finds their Stripe customer ID from profiles
- Creates a Stripe Billing Portal session
- Returns the portal URL

---

## Step 3: Admin Notification

Instead of Pterodactyl auto-sync, the admin panel will show boost information:
- **Request Details Modal**: Display current RAM boost and CPU boost values with visual indicators
- **Admin Requests Table**: Show a boost badge on rows where `ram_boost > 0` or `cpu_boost > 0`
- When a webhook fires and updates boosts, the admin will see the changes next time they view the request

---

## Step 4: Frontend -- Upgrade Page

### New route: `/server/:id/upgrade` (protected)

```text
+------------------------------------------+
|  Current Server Specs                     |
|  RAM: 2.5GB (Free) + 1GB (Boost) = 3.5GB |
|  CPU: 100% (Free) + 0% (Boost) = 100%    |
+------------------------------------------+
|                                           |
|  Add Extra RAM                            |
|  [----O-----------] 1 GB                  |
|  1.50 CHF/month                           |
|                                           |
|  Add Extra CPU                            |
|  [----O-----------] 100%                  |
|  1.50 CHF/month                           |
|                                           |
+------------------------------------------+
|  /!\ DISCLAIMER (yellow/orange alert)     |
|  "Note: Upgrades are usually instant,     |
|   but in some cases, it may take up to    |
|   24 hours for the new resources to be    |
|   applied to your server."                |
+------------------------------------------+
|  Total: 3.00 CHF / month                  |
|  [ Go to Checkout ]                       |
+------------------------------------------+
```

- Sliders: RAM 0-8 GB (step 1), CPU 0-800% (step 100)
- Live price calculation: `(ramQty + cpuQty) * 1.50 CHF`
- "Go to Checkout" calls `create-checkout-session` and redirects to Stripe

### "Need more power?" button
- Added to `ServerStatusCard` below the "Open Game Panel" button when server is active
- Links to `/server/{requestId}/upgrade`

---

## Step 5: Subscription Management

- Add a "Manage Subscription" card to `DashboardSettings`
- Shows current boost stats if the user has an active subscription
- "Manage Subscription" button calls `customer-portal` and opens Stripe portal in a new tab
- Only visible when `stripe_subscription_id` is set on their server request

---

## Step 6: Hook & Type Updates

- Update `useServerRequest` interface to include `cpu_boost`, `ram_boost`, `stripe_subscription_id`
- Add Stripe price constants to `src/config/constants.ts`

---

## Files to Create/Modify

| File | Action |
|------|--------|
| Database migration | Add columns to `server_requests` and `profiles` |
| `supabase/functions/create-checkout-session/index.ts` | New |
| `supabase/functions/stripe-webhook/index.ts` | New |
| `supabase/functions/customer-portal/index.ts` | New |
| `supabase/config.toml` | Register 3 new functions |
| `src/pages/ServerUpgrade.tsx` | New upgrade page |
| `src/App.tsx` | Add route |
| `src/hooks/useServerRequest.tsx` | Add boost fields |
| `src/components/dashboard/ServerStatusCard.tsx` | Add "Need more power?" button |
| `src/components/dashboard/DashboardSettings.tsx` | Add subscription management card |
| `src/components/dashboard/SubscriptionManagementCard.tsx` | New component |
| `src/components/admin/RequestDetailsModal.tsx` | Show boost info |
| `src/config/constants.ts` | Add Stripe price IDs |

---

## Technical Notes

- The `stripe-webhook` function will need a `STRIPE_WEBHOOK_SECRET` -- after deployment, you will need to configure a webhook endpoint in your Stripe dashboard pointing to the function URL, then provide the signing secret
- `ram_boost` is stored in MB (e.g., 1 GB = 1024 MB) for precision
- Base specs (2.5GB RAM, 100% CPU) are constants in the frontend; the database only tracks the boost amounts

