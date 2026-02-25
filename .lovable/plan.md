

# Connect Wallet Top-Up to Real Stripe Payments

## Overview
Replace the mocked wallet top-up (fake 2s delay + direct DB write) with a secure Stripe Checkout flow. The wallet balance is only credited server-side after Stripe confirms payment via webhook.

## User Flow
1. User clicks "Top-Up Balance", selects an amount (e.g. 10.00 CHF)
2. Frontend calls the `create-wallet-topup` edge function
3. User is redirected to Stripe Checkout to pay
4. After payment, Stripe redirects back to `/dashboard?topup=success&session_id=...`
5. The existing `stripe-webhook` receives `checkout.session.completed`, detects it's a wallet top-up (via metadata), and credits the balance server-side
6. Dashboard detects the URL params, shows a success toast, and refreshes the wallet

## Changes

### 1. Database Migration: Add `stripe_session_id` to `wallet_transactions`
Adds a unique column to prevent duplicate credits from the same Stripe session.
```sql
ALTER TABLE public.wallet_transactions ADD COLUMN stripe_session_id text UNIQUE;
```

### 2. New Edge Function: `create-wallet-topup`
Creates a Stripe Checkout session in `mode: "payment"` with a dynamic `price_data` amount.

- Authenticates user via Authorization header
- Looks up or creates Stripe customer (reuses `stripe_customer_id` from profiles)
- Uses `price_data` with dynamic `unit_amount` (since top-up amounts vary)
- Sets metadata `{ type: "wallet_topup", userId: user.id }` so the webhook can identify it
- `success_url`: `/dashboard?topup=success&session_id={CHECKOUT_SESSION_ID}`
- `cancel_url`: `/dashboard?topup=cancelled`

### 3. Update Edge Function: `stripe-webhook`
Add a new handler inside the existing `checkout.session.completed` block:

- Check `session.metadata.type === "wallet_topup"`
- If so, extract `userId` and `amount_total` from the session
- Use service role to increment `profiles.wallet_balance`
- Insert a `wallet_transactions` record with type `credit` and the `stripe_session_id` for idempotency
- Skip the existing server-upgrade logic for wallet top-ups

### 4. Update `supabase/config.toml`
Add entry for the new function:
```toml
[functions.create-wallet-topup]
verify_jwt = false
```

### 5. Update `src/hooks/useWallet.tsx`
- Replace the mocked `topUp` function: call `supabase.functions.invoke('create-wallet-topup', { body: { amount } })`, then redirect to the returned Stripe URL
- Remove the fake `setTimeout` and direct DB writes from `topUp`
- Add a `verifyTopUp()` function that simply calls `refetch` (the webhook already credited the balance)

### 6. Update `src/components/dashboard/TopUpModal.tsx`
- Instead of showing "Processing payment..." spinner, redirect user to Stripe Checkout
- The `onTopUp` prop now returns a URL; the modal redirects via `window.location.href`

### 7. Update `src/pages/Dashboard.tsx`
- On mount, check URL for `?topup=success`
- If present, show a success toast, refetch wallet, and clean up URL params
- If `?topup=cancelled`, show an info toast and clean up

### 8. Security: Remove client-side `wallet_balance` updates
Currently the `useWallet` hook directly updates `profiles.wallet_balance` from the client. With the new flow:
- `topUp` no longer writes to the DB -- only the webhook does (using service role)
- `deduct` still writes from the client for now (wallet-based server purchases), which is acceptable since RLS allows users to update their own profile
- Future improvement: move `deduct` server-side too

## Files Summary

| File | Action |
|------|--------|
| Database migration | Add `stripe_session_id` column to `wallet_transactions` |
| `supabase/functions/create-wallet-topup/index.ts` | New -- creates Stripe Checkout session for wallet top-up |
| `supabase/functions/stripe-webhook/index.ts` | Update -- handle `wallet_topup` metadata in checkout.session.completed |
| `supabase/config.toml` | Add config for `create-wallet-topup` |
| `src/hooks/useWallet.tsx` | Replace mock topUp with Stripe redirect |
| `src/components/dashboard/TopUpModal.tsx` | Redirect to Stripe instead of fake processing |
| `src/pages/Dashboard.tsx` | Handle `?topup=success` redirect and show toast |

