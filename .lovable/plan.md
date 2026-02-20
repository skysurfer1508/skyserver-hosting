

# Automatic Pterodactyl Server Suspension and Unsuspension

## Summary
Upgrade the existing expired server cleanup system to call the Pterodactyl Application API to **suspend** servers when they expire, and **unsuspend** them when an admin reactivates. Also add a `pterodactyl_server_id` field so the system knows which panel server to target.

---

## 1. Database Changes

### Add `pterodactyl_server_id` column to `server_requests`
- New nullable `integer` column to store the Pterodactyl panel server ID
- Admins populate this when approving a request

### Add `suspended` value to `request_status` enum
- Extend from `pending | active | rejected` to include `suspended`
- Expired servers will be marked `suspended` (not `rejected`) to distinguish from admin rejections

---

## 2. Upgrade `cleanup-expired-servers` Edge Function

Current behavior: sets expired servers to `rejected` status.

New behavior:
1. Query active servers where `expires_at <= NOW()` and `expires_at IS NOT NULL`
2. Also fetch `pterodactyl_server_id` for each
3. For servers with a `pterodactyl_server_id`:
   - Call `POST {PANEL_URL}/api/application/servers/{id}/suspend` with the API key
   - Log success/failure per server
4. Update status to `suspended` with reason "Server lease expired -- automatically suspended."
5. Continue sending expiration emails as before

### Error Handling
- If the Pterodactyl API call fails, log the error but still update DB status
- Servers without a `pterodactyl_server_id` get suspended in DB only (with a warning log)

---

## 3. Upgrade Admin Reactivation to Unsuspend on Panel

### New Edge Function: `unsuspend-server`
- Called when admin reactivates an expired/suspended server
- Calls `POST {PANEL_URL}/api/application/servers/{id}/unsuspend`
- Updates DB status back to `active` with a fresh 7-day lease

### Changes to `useAdminRequests.tsx`
- `reactivateRequest` will call the `unsuspend-server` edge function instead of directly updating the DB

---

## 4. Admin UI Updates

### Approval Dialog (`AdminRequests.tsx`)
- Add a "Pterodactyl Server ID" number input field to the approval form
- Pass it through to the `encrypt-credentials` edge function which stores it

### Status Handling
- New orange "Suspended" badge for `suspended` status
- Reactivate button shown for both expired (`rejected` with auto-reason) and `suspended` servers
- Filter dropdown gets a new "Suspended" option

### Request Details Modal
- Display Pterodactyl Server ID when available

---

## 5. User Dashboard Updates

### `ServerStatusCard.tsx`
- Handle `suspended` status with a "Server Suspended" alert and renewal prompt
- Show same recovery options as expired servers

---

## 6. Files to Create/Modify

| File | Action |
|------|--------|
| Migration SQL | Add `pterodactyl_server_id` column, add `suspended` to enum |
| `supabase/functions/cleanup-expired-servers/index.ts` | Add Pterodactyl suspend API call, use `suspended` status |
| `supabase/functions/unsuspend-server/index.ts` | New function for panel unsuspension |
| `supabase/config.toml` | Add config for `unsuspend-server` |
| `src/hooks/useAdminRequests.tsx` | Update `reactivateRequest` to call unsuspend edge function |
| `src/components/admin/AdminRequests.tsx` | Add Pterodactyl ID input, suspended badge/filter |
| `src/components/admin/RequestDetailsModal.tsx` | Display Pterodactyl Server ID |
| `src/components/dashboard/ServerStatusCard.tsx` | Handle suspended status |
| `src/integrations/supabase/types.ts` | Auto-updates after migration |

---

## Technical Details

### Pterodactyl API Calls

**Suspend:**
```text
POST {PANEL_URL}/api/application/servers/{id}/suspend
Headers:
  Authorization: Bearer {PTERODACTYL_API_KEY}
  Accept: application/json
  Content-Type: application/json
```

**Unsuspend:**
```text
POST {PANEL_URL}/api/application/servers/{id}/unsuspend
Headers:
  Authorization: Bearer {PTERODACTYL_API_KEY}
  Accept: application/json
  Content-Type: application/json
```

### Secrets Required
- `PTERODACTYL_API_KEY` -- already stored
- `PTERODACTYL_PANEL_URL` -- needs to be added (e.g. `https://panel.skyserver1508.org`)

