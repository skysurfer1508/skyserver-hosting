# Split Admin Requests into "Requests" and "Servers" Tabs with Search

## Overview
The current "Requests" tab in the admin panel mixes pending requests with active/suspended/expired servers. Split it into two clearly separated tabs and add a search field to each so admins can quickly find a specific request or server.

## Changes

### 1. New tab structure in `src/pages/Admin.tsx`
Add a new `Servers` tab next to the existing `Requests` tab:
- **Requests** (`ListTodo` icon) — pending and rejected requests only
- **Servers** (new, `Server` icon) — approved/active, suspended, and auto-expired servers

### 2. Split `AdminRequests.tsx` into two components
Refactor the existing logic into two focused components that share the same `useAdminRequests` hook:

- **`AdminRequests.tsx`** — shows requests with status `pending` or `rejected` (excluding auto-expired ones that originated from active servers). Status filter limited to: All / Pending / Rejected. Actions: Approve, Reject, Delete.
- **`AdminServers.tsx`** (new) — shows requests with status `active`, `suspended`, or auto-expired (`rejected` with reason "Server lease expired automatically."). Status filter: All / Active / Suspended / Expired. Actions: Reactivate (for suspended/expired), Delete, view details.

Shared helpers (`getExpiryInfo`, `getStatusBadge`, `gameLabels`) are moved into a small `src/components/admin/requestsShared.tsx` (or kept duplicated minimally) to avoid cross-imports.

### 3. Search field on both tabs
Add an `Input` with a search icon above the table in both `AdminRequests` and `AdminServers`. The search is case-insensitive and matches against:
- User email
- Discord username
- Server name
- Game type
- Assigned IP (Servers tab only)

The search input sits alongside the existing status filter `Select` in the card header.

### 4. No backend or schema changes
All filtering happens client-side over the data already returned by `useAdminRequests`. No migrations, no edge function changes.

## Files Summary

| File | Action |
|------|--------|
| `src/pages/Admin.tsx` | Add new `Servers` tab + trigger |
| `src/components/admin/AdminRequests.tsx` | Trim to pending/rejected only; add search input |
| `src/components/admin/AdminServers.tsx` | New — active/suspended/expired servers with search |
| `src/components/admin/requestsShared.tsx` | New — shared `getExpiryInfo`, `getStatusBadge`, `gameLabels` helpers |
