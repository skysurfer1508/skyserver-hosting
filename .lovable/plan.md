

# Admin Upgrades Tab + Purchase Confirmation Email

## Overview

Add a new "Upgrades" tab to the admin Command Center that lists all servers with active resource boosts, and send a confirmation email to the user when a boost purchase is completed via the Stripe webhook.

---

## Part 1: Admin "Upgrades" Tab

### New component: `src/components/admin/AdminUpgrades.tsx`

A dedicated tab showing all server requests that have active boosts (`ram_boost > 0` or `cpu_boost > 0`). Displays:

- Server name, game type, user email
- RAM boost (in GB) and CPU boost (in %)
- Stripe subscription ID (for reference)
- A visual "Action Required" badge to remind admins to apply the resources in the game panel
- Date the boost was last updated

The component will reuse `useAdminRequests` to fetch data and filter to only show boosted servers.

### Modify: `src/pages/Admin.tsx`

- Import `AdminUpgrades` and the `Zap` icon from lucide-react
- Add a 7th tab trigger ("Upgrades" with the Zap icon)
- Add the corresponding `TabsContent`
- Update grid from `grid-cols-6` to `grid-cols-7` and width from `lg:w-[600px]` to `lg:w-[700px]`

---

## Part 2: Purchase Confirmation Email

### Modify: `supabase/functions/stripe-webhook/index.ts`

After successfully updating the `server_requests` table with boost values in the `checkout.session.completed` handler:

1. Look up the user's email from the `profiles` table using the `userId` from metadata
2. Look up the server name from `server_requests`
3. Send a confirmation email via Resend (`RESEND_API_KEY` is already configured) with:
   - Subject: "Your SkyServer1508 upgrade is confirmed!"
   - Body: Details of what was purchased (RAM boost in GB, CPU boost in %), a note that it may take up to 24 hours to apply, and a link back to the dashboard

The email will use the same Resend setup and sender address (`noreply@skyserver1508.org`) as the existing auth emails.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/admin/AdminUpgrades.tsx` | New -- Upgrades tab component |
| `src/pages/Admin.tsx` | Modify -- Add 7th tab |
| `supabase/functions/stripe-webhook/index.ts` | Modify -- Add confirmation email after checkout |

---

## Technical Details

### AdminUpgrades component structure
- Fetches all requests via `useAdminRequests` hook
- Filters to `request.ram_boost > 0 || request.cpu_boost > 0`
- Table columns: User, Server, Game, RAM Boost, CPU Boost, Subscription ID, Updated
- Empty state when no active boosts exist

### Webhook email addition
- Import Resend in the stripe-webhook function
- After the DB update in `checkout.session.completed`, query `profiles` for the user email
- Query `server_requests` for the server name
- Send email with Resend using the existing `noreply@skyserver1508.org` sender
- Email sending is non-blocking (errors are logged but don't fail the webhook)

