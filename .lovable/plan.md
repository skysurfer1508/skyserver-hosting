

# Fix Stripe Webhook 502: Handle `invoice.payment_succeeded`

## Problem

The `stripe-webhook` edge function returns a 502 when Stripe sends an `invoice.payment_succeeded` event (recurring payment). The function doesn't handle this event type, so it falls through without issues on the happy path -- but any unexpected error in parsing causes the outer `catch` to return a 400, which Stripe interprets as a failure and retries.

## Solution

Add an `invoice.payment_succeeded` handler and make the function resilient so it always returns 200 to Stripe.

---

## Changes to `supabase/functions/stripe-webhook/index.ts`

### 1. Add `invoice.payment_succeeded` handler

After the `checkout.session.completed` block, add a new block:

- Extract `serverId` safely from two possible locations:
  - `invoice.subscription_details?.metadata?.serverId`
  - `invoice.lines?.data?.[0]?.metadata?.serverId`
- If no `serverId` found, log and skip (return 200)
- Look up the subscription via Stripe to read current line items
- Calculate `ram_boost` and `cpu_boost` from the subscription items (same logic as checkout handler)
- Update `server_requests` in the database to ensure boost values are current
- Log the result (no Pterodactyl call -- admins handle resource application manually)

### 2. Make the function always return 200

The current outer `catch` returns a 400 on errors. This causes Stripe to retry indefinitely. Change the error handling:

- Move signature verification errors to still return 400 (invalid signature should reject)
- Wrap all event processing logic in its own `try/catch` that logs errors but does NOT throw
- The final `return new Response(...)` with status 200 is always reached for valid webhook events

### 3. Structure after changes

```text
1. Validate env vars (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
2. Parse body + verify signature -> if fails, return 400
3. Log event type
4. try {
     if checkout.session.completed -> existing logic
     if invoice.payment_succeeded -> new handler (log + update DB)
     if customer.subscription.deleted -> existing logic
   } catch (processingError) {
     log error but do NOT return error
   }
5. return 200 { received: true }  <-- ALWAYS
```

---

## File Summary

| File | Action |
|------|--------|
| `supabase/functions/stripe-webhook/index.ts` | Modify -- add invoice handler + fix error handling |

---

## Technical Details

### Invoice metadata extraction

```typescript
const invoice = event.data.object;
const serverId =
  invoice.subscription_details?.metadata?.serverId ||
  invoice.lines?.data?.[0]?.metadata?.serverId;
```

### Error handling restructure

The key fix: after signature verification succeeds, all event processing is wrapped in a non-throwing try/catch. The function always returns 200 to Stripe for verified events, even if internal processing fails. This prevents Stripe from retrying on transient errors.

