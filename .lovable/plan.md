

# Rebuild Help Center Page

## Overview
Replace the current Help Center with a modern, game-categorized FAQ page using a Tabs layout (one tab per game) with Accordion-style Q&A items inside each tab. All content will be translated from the provided German into professional, technical English.

## Layout Design
- Hero section with title "Help Center" and search bar (keep existing style)
- Horizontal Tabs for each game: Satisfactory, CS2, Factorio, Minecraft, Rust, ARK
- Each tab icon uses a relevant Lucide icon (Factory, Crosshair, Cog, Pickaxe, Shield, Skull)
- Inside each tab: Accordion with Q&A pairs -- question as trigger, answer as collapsible content
- Markdown-style rendering for code blocks, bold text, and lists within answers
- Mobile-responsive: tabs scroll horizontally on small screens

## Content Summary (6 games, ~25 total Q&A items)
- **Satisfactory** (5 items): Timeout fixes, OOM crashes, autosave errors, tick-rate issues, memory management
- **CS2** (5 items): GSLT setup, RCON config, server visibility, post-update RCON, remote commands
- **Factorio** (5 items): Save file loading, new map generation, swapping saves, RCON setup, mod installation
- **Minecraft** (5 items): Java version crashes, chunk lag, world size limits, Bedrock version issues, RAM/performance
- **Rust** (4 items): Admin setup (ownerid), map vs blueprint wipe, users.cfg issues, post-wipe old data
- **ARK** (4 items): Mod installation, crossplay, mod loading failures, multiple startup parameters

## Technical Details

### File Changed
`src/pages/Help.tsx` -- complete rewrite

### Approach
- Use existing `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs`
- Use existing `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` from `@/components/ui/accordion`
- Keep the `Layout` wrapper and `motion` animations from framer-motion
- Define game data as a structured array with `id`, `label`, `icon`, and `questions[]` (each with `question`, `answer`)
- Answers use a simple renderer for bold, inline code, and code blocks
- Search bar filters across all games and questions
- Icons: Factory (Satisfactory), Crosshair (CS2), Cog (Factorio), Pickaxe (Minecraft), Shield (Rust), Skull (ARK)

### No other files need changes
The route is already configured, Layout/Tabs/Accordion components already exist.

