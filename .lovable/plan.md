

# Add Cancellation Confirmation Email to Cancel Subscription Flow

## Problem

When a user cancels their subscription, the `cancel-subscription` edge function sets it to cancel at period end via Stripe, but does **not** send the user a confirmation email. The user only receives an email later when the subscription is fully terminated (`customer.subscription.deleted` webhook). There is no immediate confirmation that the cancellation was scheduled.

## Solution

Add email sending to the `cancel-subscription` edge function, notifying the user that their upgrade will end on a specific date.

---

## Changes

### File: `supabase/functions/cancel-subscription/index.ts`

After the Stripe `subscriptions.update` call succeeds, add:

1. Look up the user's email from the `profiles` table using the authenticated `userId`
2. Calculate the human-readable cancellation date from `subscription.current_period_end`
3. Send a confirmation email via Resend with:
   - Subject: "Your SkyServer1508 upgrade cancellation is confirmed"
   - Body includes: server name, cancellation date, note that boosts remain active until then, link to dashboard
4. Wrap email sending in a try/catch so it is **non-blocking** (a failed email does not prevent the cancellation response)

### Email Content

The email will follow the same style as existing emails (inline styles, SkyServer1508 branding) and include:
- Heading confirming the cancellation
- Server name and end date
- Reassurance that boosts stay active until that date
- Link to re-upgrade from the dashboard

---

## Technical Details

```text
// After stripe.subscriptions.update succeeds:

1. Query profiles table for user email
2. Check RESEND_API_KEY exists
3. Send email via Resend (non-blocking try/catch)
4. Log success or failure
5. Return normal response regardless of email outcome
```

| File | Action |
|------|--------|
| `supabase/functions/cancel-subscription/index.ts` | Add Resend email after successful Stripe cancellation |

