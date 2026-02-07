
# Content & Navigation Update Plan

## Overview

This plan updates the platform to reflect that advanced features (FTP access, mod support) are now live, and reorganizes the header to put Login/Dashboard buttons directly on the top bar while adding a new "Game Panel" external link.

---

## Changes Summary

### 1. Header Component (`Header.tsx`)

**Layout Changes:**
- Move Login/Dashboard buttons OUT of the hamburger menu to the top bar (between logo and hamburger icon)
- Add "Game Panel" link to the navigation menu inside the drawer
- Keep hamburger menu for navigation links only

**New Navigation Item:**
```typescript
{ name: 'Game Panel', href: 'https://panel.skyserver.io', icon: Terminal, external: true }
```

**Top Bar Structure:**
```text
[Logo] -------- [Login/Dashboard Buttons] [Hamburger Icon]
```

---

### 2. Roadmap Section (`RoadmapSection.tsx`)

**Phase 1 (Current - Beta Launch)** - Updated items:
- Minecraft, Terraria & Satisfactory support
- User registration & authentication
- Server request system with admin approval
- Full FTP Access (File Management)
- Mod & Plugin Support
- DDoS Protection

**Phase 2 (Upcoming - Automation)** - New goals:
- One-Click Modpack Installer
- Automated World Backups
- Scheduled server restarts
- Discord Bot Integration

**Phase 3 (Future - Community)** - Updated items:
- Community voting for new games
- Custom subdomains (myserver.skyserver.io)
- Public server browser
- Advanced analytics dashboard

---

### 3. Features Section (`FeaturesSection.tsx`)

**Add two new benefit cards:**

| Title | Icon | Description |
|-------|------|-------------|
| Full FTP Access | FolderOpen | Access your server files directly. Upload your own worlds, configs, and mods without restrictions. |
| Modding Supported | Puzzle | Want to play Modded Minecraft or TModLoader? You have full write access to install whatever you want. |

**Updated benefits array (8 total cards):**
1. Free Hosting
2. Full FTP Access (NEW)
3. Modding Supported (NEW)
4. Low Latency
5. High Uptime
6. DDoS Protection
7. Instant Setup
8. Easy Control

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/layout/Header.tsx` | Move auth buttons to top bar, add Game Panel link |
| `src/components/landing/RoadmapSection.tsx` | Update phase content |
| `src/components/landing/FeaturesSection.tsx` | Add FTP and Modding cards |

---

## Technical Details

### Header.tsx Changes

**New imports:**
```typescript
import { Terminal } from 'lucide-react';
```

**Add to navItems array:**
```typescript
{ name: 'Game Panel', href: 'https://panel.skyserver.io', icon: Terminal, external: true }
```

**Top bar layout (between logo and hamburger):**
```tsx
{/* Auth Buttons - Visible on top bar */}
<div className="flex items-center gap-2">
  {user ? (
    <Link to="/dashboard">
      <Button variant="outline" size="sm">
        <User className="h-4 w-4 mr-2" />
        Dashboard
      </Button>
    </Link>
  ) : (
    <>
      <Link to="/login">
        <Button variant="ghost" size="sm">Login</Button>
      </Link>
      <Link to="/register">
        <Button size="sm" className="glow-primary">Get Started</Button>
      </Link>
    </>
  )}
  {/* Hamburger menu trigger */}
</div>
```

**Game Panel link handling (external URL):**
```typescript
const handleNavClick = (href: string, external?: boolean) => {
  setMenuOpen(false);
  if (external) {
    window.open(href, '_blank');
    return;
  }
  // ... existing logic
};
```

### RoadmapSection.tsx - Updated Phases Array

```typescript
const phases = [
  {
    phase: 'Phase 1',
    status: 'current',
    title: 'Beta Launch',
    description: 'Full-featured game servers with FTP access and mod support.',
    icon: CheckCircle2,
    items: [
      'Minecraft, Terraria & Satisfactory support',
      'User registration & server request system',
      'Full FTP Access for file management',
      'Mod & Plugin support (install your own)',
      'DDoS Protection included',
      'Admin approval workflow',
    ],
  },
  {
    phase: 'Phase 2',
    status: 'upcoming',
    title: 'Automation',
    description: 'One-click installers and automated backups.',
    icon: Clock,
    items: [
      'One-Click Modpack Installer',
      'Automated World Backups',
      'Scheduled server restarts',
      'Discord Bot for server status',
      'Server console access',
    ],
  },
  {
    phase: 'Phase 3',
    status: 'future',
    title: 'Community Features',
    description: 'Community voting and custom subdomains.',
    icon: Rocket,
    items: [
      'Community voting for new games',
      'Custom subdomains (myserver.skyserver.io)',
      'Public server browser',
      'Advanced analytics dashboard',
    ],
  },
];
```

### FeaturesSection.tsx - Updated Benefits Array

```typescript
import { FolderOpen, Puzzle } from 'lucide-react';

const benefits = [
  {
    icon: Zap,
    title: 'Free Hosting',
    description: 'No credit card required. No subscription fees. Completely free forever.',
  },
  {
    icon: FolderOpen,
    title: 'Full FTP Access',
    description: 'Access your server files directly. Upload your own worlds, configs, and mods without restrictions.',
  },
  {
    icon: Puzzle,
    title: 'Modding Supported',
    description: 'Want to play Modded Minecraft or TModLoader? You have full write access to install whatever you want.',
  },
  {
    icon: Globe,
    title: 'Low Latency',
    description: 'Servers located in Switzerland for excellent European connectivity.',
  },
  {
    icon: Clock,
    title: 'High Uptime',
    description: '99.9% uptime guarantee with automatic backups and monitoring.',
  },
  {
    icon: Shield,
    title: 'DDoS Protection',
    description: 'Enterprise-grade protection to keep your server online.',
  },
  {
    icon: Server,
    title: 'Instant Setup',
    description: 'Your server is ready within minutes after approval.',
  },
  {
    icon: Gamepad2,
    title: 'Easy Control',
    description: 'Simple dashboard to manage your server with one click.',
  },
];
```

**Grid layout update for 8 cards:**
- The existing `lg:grid-cols-3` layout works well
- Cards will display as 3-3-2 on large screens
- Consider using `lg:grid-cols-4` for a 4-4 layout if preferred

---

## Visual Preview

### Header Layout (After Changes)
```text
+------------------------------------------------------------------+
| [Logo] SkyServer          [Login] [Get Started]  [Hamburger]     |
+------------------------------------------------------------------+

OR (when logged in):

+------------------------------------------------------------------+
| [Logo] SkyServer                    [Dashboard]  [Hamburger]     |
+------------------------------------------------------------------+
```

### Drawer Menu (After Changes)
```text
+----------------------------------+
| SkyServer                        |
+----------------------------------+
| Home                             |
| Games (Collapsible)              |
| Features                         |
| Roadmap                          |
| FAQ                              |
| Tech Stack                       |
| Game Panel (External) ->         |
+----------------------------------+
| Admin Panel (if admin)           |
| Logout                           |
+----------------------------------+
```
