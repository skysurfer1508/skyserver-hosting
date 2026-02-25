
# Prepaid Wallet System

## Overview
Add a wallet with mock balance and transaction history to the dashboard, plus a "Pay with Wallet" option on the Server Upgrade page. All state is stored in a new `wallet_balance` column in the `profiles` table and a new `wallet_transactions` table.

---

## 1. Database Changes (2 migrations)

### Migration A: Add `wallet_balance` to `profiles`
```sql
ALTER TABLE public.profiles ADD COLUMN wallet_balance numeric(10,2) NOT NULL DEFAULT 0.00;
```

### Migration B: Create `wallet_transactions` table
```sql
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.wallet_transactions FOR SELECT
  USING (public.is_admin(auth.uid()));
```

---

## 2. New Hook: `src/hooks/useWallet.tsx`

Provides wallet state and operations:
- `balance`: current wallet balance (from `profiles.wallet_balance`)
- `transactions`: recent transaction history (from `wallet_transactions`)
- `isLoading`: loading state
- `topUp(amount)`: simulates a payment (2s delay), then updates `profiles.wallet_balance` via Supabase update and inserts a 'credit' row into `wallet_transactions`
- `deduct(amount, description)`: subtracts from balance, inserts a 'debit' row
- `refetch()`: re-fetches balance and transactions

---

## 3. New Component: `src/components/dashboard/WalletCard.tsx`

A card displayed in the Dashboard sidebar (Server tab) showing:
- Current balance formatted as "XX.XX CHF" with a wallet icon
- "Top-Up Balance" button that opens a modal
- Recent transactions list (scrollable, max 5 entries) with green/red color coding

---

## 4. New Component: `src/components/dashboard/TopUpModal.tsx`

A dialog triggered by the "Top-Up Balance" button:
- Quick-select buttons: 5.00, 10.00, 20.00 CHF
- Custom amount input field
- "Proceed to Payment" button that:
  1. Shows a loading spinner for 2 seconds (simulated payment)
  2. Calls `topUp(amount)` from the wallet hook
  3. Shows a success toast
  4. Closes the modal

---

## 5. Update Dashboard (`src/pages/Dashboard.tsx`)

Add the WalletCard to the Server tab sidebar (between PlatformStatusCard and NewsFeed):
```
<WalletCard />
```

---

## 6. Update Server Upgrade Page (`src/pages/ServerUpgrade.tsx`)

In the checkout section at the bottom of the page, add wallet payment logic:

- Import and use the `useWallet` hook
- Calculate the total cost based on selected package
- Below the existing "Go to Checkout" button, add a wallet payment section:
  - If `balance >= total`: Show a green "Pay with Wallet Balance (XX.XX CHF)" button
  - If `balance < total`: Show "Insufficient Balance" warning + "Top-Up Balance" button (opens TopUpModal)
- When "Pay with Wallet" is clicked:
  1. Call `deduct(total, description)` 
  2. Show success toast
  3. Navigate back to dashboard

---

## 7. Files Summary

| File | Action |
|------|--------|
| Database migration | Add `wallet_balance` to profiles, create `wallet_transactions` table |
| `src/hooks/useWallet.tsx` | New hook for wallet state and operations |
| `src/components/dashboard/WalletCard.tsx` | New wallet card with balance + transactions |
| `src/components/dashboard/TopUpModal.tsx` | New top-up modal with quick amounts + custom input |
| `src/pages/Dashboard.tsx` | Add WalletCard to sidebar |
| `src/pages/ServerUpgrade.tsx` | Add wallet payment option in checkout section |
