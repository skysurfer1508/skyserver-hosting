

# Show Expiration-Specific Message When Server Lease Expires

## Overview
When a server expires (auto-rejected by the cleanup process), the user currently sees a generic "Your server request was rejected" message. This change will detect expired servers and show a tailored message telling the user to open a Discord ticket to get their server back.

## How It Works
The cleanup edge function sets `rejection_reason` to `"Server lease expired automatically."` when expiring a server. We will check for this specific reason to show a distinct expired-server UI instead of the generic rejection message.

## Changes

### `src/components/dashboard/ServerStatusCard.tsx`
- Add a helper variable: `const isExpired = request.status === 'rejected' && request.rejection_reason === 'Server lease expired automatically.';`
- Update the rejection Alert (lines 515-528) to show a different message when expired:
  - Title: "Server Expired" instead of "Request Rejected"
  - Body: Explains the lease expired and instructs the user to open a Discord ticket to recover the server
  - Includes a button linking to the Discord invite URL
- Update the bottom rejection block (lines 699-708) similarly:
  - Show an expiration-themed message with a Clock icon instead of XCircle
  - Include a prominent "Open Discord Ticket" button linking to `DISCORD_INVITE_URL`
- Import `DISCORD_INVITE_URL` from `@/config/constants`

### Message Content
For expired servers, the user will see:
- A warning-styled alert with title "Server Expired"
- Text: "Your server lease has expired. To get your server back, please open a ticket on our Discord server."
- A button: "Open Discord Ticket" that links to the Discord invite URL

For regular rejections, the existing message remains unchanged.

