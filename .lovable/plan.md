

# Add "Server Management (Pterodactyl)" Help Center Section

## Overview
Add a new tab to the existing Help Center at `/help` covering general Pterodactyl panel management topics: automated restarts, automated backups, SFTP access, changing Java version, and using the console. This follows the exact same pattern as the existing game-specific tabs.

## Changes

### `src/data/helpArticles.ts`
- Import the `Server` icon from `lucide-react` (represents server/panel management well)
- Add a new `GameCategory` entry to the `gameCategories` array with:
  - `id: 'pterodactyl'`
  - `label: 'Server Management'`
  - `icon: Server`
  - Five questions covering the requested topics:

1. **"How do I set up automated server restarts?"** -- Navigating to Schedules tab, creating a schedule, simple cron explanation (Minute: 0, Hour: 4 = 4:00 AM), adding a "Send Power Action" > "Restart Server" task
2. **"How do I set up automated backups?"** -- Same Schedules tab flow, creating a "Daily Backup" schedule, adding a "Create Backup" task, tip about preventing data loss from plugin errors
3. **"How do I connect via SFTP to manage my server files?"** -- Finding SFTP details in the Settings tab, connecting with FileZilla/WinSCP using the server password
4. **"How do I change the Java version for my server?"** -- Going to Startup tab, changing the Docker Image variable, switching between Java 8/17/21
5. **"How do I use the server console?"** -- Viewing live logs, sending commands directly, basic usage tips

### No other file changes needed
The Help page (`src/pages/Help.tsx`) dynamically renders all entries from `gameCategories`, so adding to the data file is all that's required. The new tab will automatically appear with the icon, label, badge count, and accordion Q&A items.

## Tone
Friendly, concise, step-by-step instructions matching the existing help articles. Uses bold text for UI element names, code blocks for paths/commands, and practical tips where relevant.

