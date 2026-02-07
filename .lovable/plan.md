

# SkyServer1508 - Game Server Hosting Platform

## Overview
A fully functional, production-ready Game Server Hosting Platform with a modern gaming aesthetic, built for gamers by gamers. Swiss-based, non-profit student project offering free game server hosting.

---

## Phase 1: Foundation & Backend

### Database Setup (Lovable Cloud + Supabase)
- **profiles** table - User information (id, username, email, created_at) linked to auth.users with cascade delete
- **user_roles** table - Separate table for roles (admin/user) with security definer function to prevent privilege escalation
- **server_requests** table - Server request tracking with status workflow (pending → active/rejected), IP/port assignment
- **system_settings** table - Global configuration (total_slots: 50, maintenance_mode, global_alert_message)
- Row Level Security policies on all tables
- First-user-is-admin trigger: automatically grants admin role to the very first registered user

---

## Phase 2: Authentication Flow

### Supabase Auth Integration
- Email/password authentication
- Login and Registration pages with gaming-themed design
- Session sync across all devices (phone ↔ laptop)
- Protected routes for dashboard and admin panel
- Logout functionality in header

---

## Phase 3: Landing Page (Public)

### Hero Section
- Bold headline: "Your own Game Server: 100% Free"
- Subtext about Swiss student project, no credit card, no hidden fees
- Call-to-action buttons: "Get Started" / "Learn More"

### Features Section
- Available games display: Minecraft, Terraria, Satisfactory, Valheim, ARK
- Benefit cards: Free hosting, Low latency, High uptime

### About / Trust Section
- Story about being a fair student project from Switzerland
- Emphasis on privacy and performance
- "Built by gamers, for gamers"

### Footer
- Links: Discord, Imprint, Terms of Service
- Copyright notice

---

## Phase 4: User Dashboard

### Status Overview Card
- **No server requested**: Display "Request Server" button
- **Pending approval**: Show "Approval Pending" badge with timestamp
- **Active server**: Display Server IP, Port, game type, and visual Start/Stop controls

### Server Request Flow
- Game type selector (Minecraft, Terraria, Satisfactory, Valheim, ARK)
- Custom server name input
- Confirmation modal
- Success/error toast notifications

### Global Alerts
- Yellow maintenance banner when system is in maintenance mode
- Capacity warning when slots are full
- Real-time sync status indicator

---

## Phase 5: Admin Panel

### Access Control
- Route: `/admin` - Admin role required
- Redirect unauthorized users to dashboard

### Request Management
- List of all server requests with filters (pending/active/rejected)
- Approve button → Opens IP/Port assignment form
- Reject button → Confirmation modal
- User email and request timestamp displayed

### System Settings
- Total slots input (current capacity management)
- Maintenance mode toggle
- Global alert message editor
- Live slot counter (used/total)

---

## Phase 6: Design System

### Dark Gaming Theme
- Background: Deep blacks and dark greys (#0a0a0a, #1a1a1a)
- Accent colors: Neon blue (#00d4ff) and purple (#8b5cf6)
- Glowing button effects and subtle animations
- Gaming-inspired typography

### Mobile-First Responsive Design
- Dashboard optimized for smartphone screens
- Collapsible navigation on mobile
- Touch-friendly button sizes
- Card-based layouts that stack on mobile

---

## Phase 7: Self-Hosting Files

### Docker Configuration
- **Dockerfile**: Multi-stage build with Node.js for building and Nginx for serving
- **nginx.conf**: Production-optimized config with gzip, caching, and SPA routing
- **.dockerignore**: Exclude node_modules, .git, and dev files

### Deployment Ready
- Environment variable support for Supabase URL and anon key
- Build commands documented in README
- Health check endpoint

---

## User Experience Highlights
- ✅ Real-time sync across all devices (no localStorage)
- ✅ English-only interface with professional messaging
- ✅ Clear status indicators (pending, active, rejected)
- ✅ Maintenance mode awareness with user-friendly banners
- ✅ Error messages guide users to Discord support

