
## Add Benefits Section to Server Upgrade Page

Add a visually appealing "Benefits" card on the Server Upgrade page that highlights the perks users get when purchasing extra resources.

### What will be added

A new card placed between the "Current Server Specs" card and the "Add Extra Resources" card, listing the following benefits:

- **Prioritized Support** -- Faster response times from the support team
- **Permanent Server** -- Server will never expire (no more 7-day lease renewals)
- **Priority Queue** -- Upgrade requests are processed first
- **Performance Boost** -- Direct hardware resource improvements

Each benefit will be displayed as a list item with a checkmark icon, a title, and a short description, styled consistently with the existing gaming-card design.

### Technical Details

**File modified:** `src/pages/ServerUpgrade.tsx`

- Import `Shield`, `Headset`, `Clock`, `Check` icons from `lucide-react`
- Add a new `Card` component between lines 141 and 143 (after Current Specs, before Upgrade Sliders)
- The card will contain a grid/list of benefit items, each with a green check icon, bold title, and muted description
- Only shown when the user does NOT already have an active subscription (same condition as the sliders)
