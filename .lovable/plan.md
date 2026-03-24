

# Admin Upgrade Approval and Deletion

## Overview
Add an approval workflow for server upgrades. When a user purchases an upgrade via Stripe, it arrives as "Pending" until an admin approves it. Admins can also delete upgrades (resetting boosts to zero) so users can purchase a new one.

## Changes

### 1. Database Migration
Add a `boost_status` column to `server_requests`:
```sql
ALTER TABLE public.server_requests 
  ADD COLUMN boost_status text NOT NULL DEFAULT 'none'
  CHECK (boost_status IN ('none', 'pending', 'approved'));
```
- `none` = no boost purchased
- `pending` = purchased but awaiting admin approval
- `approved` = admin has applied the upgrade

### 2. Update Stripe Webhook
In `supabase/functions/stripe-webhook/index.ts`, when a checkout or invoice payment sets `ram_boost`/`cpu_boost`, also set `boost_status = 'pending'`.

When a subscription is deleted, reset `boost_status` back to `'none'`.

### 3. Update AdminUpgrades Component
Replace the static "Action Required" badge with dynamic status based on `boost_status`. Add two action buttons per row:
- **Approve** button (for pending upgrades) -- updates `boost_status` to `'approved'` via a direct Supabase update
- **Delete** button -- resets `ram_boost`, `cpu_boost`, `stripe_subscription_id`, and `boost_status` to defaults, freeing the user to buy again

Add confirmation dialogs for both actions.

### 4. Update User-Facing BillingPurchases Component
Show the `boost_status` to users:
- `pending` = "Pending Approval" badge (amber)
- `approved` = "Active" badge (green)

This replaces the current always-"Active" badge.

### 5. Update SubscriptionManagementCard
Same status logic -- show "Pending Approval" or "Active" based on `boost_status`.

### 6. Update useAdminRequests Hook
The `ServerRequest` interface already includes all needed fields. The admin update calls will use direct Supabase queries within the AdminUpgrades component.

## Files Summary

| File | Action |
|------|--------|
| Database migration | Add `boost_status` column |
| `supabase/functions/stripe-webhook/index.ts` | Set `boost_status = 'pending'` on purchase, `'none'` on deletion |
| `src/components/admin/AdminUpgrades.tsx` | Add Approve/Delete buttons with confirmation dialogs |
| `src/components/dashboard/BillingPurchases.tsx` | Show pending/approved status |
| `src/components/dashboard/SubscriptionManagementCard.tsx` | Show pending/approved status |

