
# Billing & Purchases Tab

## Overview

Add a "My Purchases" tab to the user dashboard where users can view and cancel their active resource subscriptions. Create a cancel-subscription edge function that sets `cancel_at_period_end: true` (users keep resources until the end of the paid cycle). Enhance the webhook to send a "subscription ended" email when the subscription is fully deleted.

---

## Part 1: New Dashboard Tab

### Modify: `src/pages/Dashboard.tsx`

- Import `CreditCard` from lucide-react
- Add a third tab trigger "My Purchases" with the CreditCard icon
- Add corresponding `TabsContent` rendering the new `BillingPurchases` component

### New: `src/components/dashboard/BillingPurchases.tsx`

- Query `server_requests` for the current user where `stripe_subscription_id IS NOT NULL`
- Display a card per subscription showing:
  - Server name and game type
  - RAM boost (in GB) and CPU boost (in %)
  - Status badge: "Active" (green) or "Canceling on [date]" (orange)
  - "Cancel Subscription" button (red/destructive)
- Confirmation dialog (AlertDialog) before canceling, showing the period end date
- Calls the `cancel-subscription` edge function on confirm
- Local state tracks `cancel_at` date per server after cancellation
- Empty state when no subscriptions exist

### Modify: `src/components/dashboard/DashboardSettings.tsx`

- Remove the `SubscriptionManagementCard` import and usage (billing is now in its own tab)

---

## Part 2: Cancel Subscription Edge Function

### New: `supabase/functions/cancel-subscription/index.ts`

- Authenticates the user via the Authorization header (using Supabase service role to verify the JWT and extract user ID)
- Accepts `{ serverId }` in the request body
- Looks up `server_requests` to get `stripe_subscription_id`, verifying `user_id` matches the authenticated user
- Calls `stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })`
- Returns `{ success: true, cancel_at: subscription.current_period_end }` as a Unix timestamp
- Does NOT cancel immediately -- the user keeps their resources until the billing period ends

### Modify: `supabase/config.toml`

- Add `[functions.cancel-subscription]` with `verify_jwt = false`

---

## Part 3: Webhook -- Subscription Ended Email

### Modify: `supabase/functions/stripe-webhook/index.ts`

Enhance the existing `customer.subscription.deleted` handler:

- After resetting `ram_boost` and `cpu_boost` to 0, look up the affected server row to get the `user_id` and `server_name`
- Query `profiles` for the user's email
- Send a "subscription ended" email via Resend: "Your subscription for [server name] has ended. Resources have been reverted to the free tier."
- Email sending is non-blocking (errors are logged but don't fail the webhook)

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/dashboard/BillingPurchases.tsx` | Create -- Billing tab component |
| `supabase/functions/cancel-subscription/index.ts` | Create -- Cancel subscription edge function |
| `src/pages/Dashboard.tsx` | Modify -- Add 3rd tab |
| `src/components/dashboard/DashboardSettings.tsx` | Modify -- Remove SubscriptionManagementCard |
| `supabase/functions/stripe-webhook/index.ts` | Modify -- Add email on subscription.deleted |

---

## Technical Details

### BillingPurchases query

```typescript
const { data } = await supabase
  .from('server_requests')
  .select('*')
  .eq('user_id', user.id)
  .not('stripe_subscription_id', 'is', null);
```

### Cancel subscription edge function flow

```text
Frontend -> cancel-subscription({ serverId })
  -> Verify user owns the server
  -> stripe.subscriptions.update(subId, { cancel_at_period_end: true })
  -> Return { success: true, cancel_at: current_period_end }
```

### Subscription ended email (webhook addition)

After resetting boosts in the `customer.subscription.deleted` handler:

1. Before clearing `stripe_subscription_id`, first query the server row to get `user_id` and `server_name`
2. Query `profiles` for the email using `user_id`
3. Send email via Resend with subject "Your SkyServer1508 subscription has ended"
4. Non-blocking -- errors logged but webhook still returns 200
