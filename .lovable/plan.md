

# SEO Optimization Plan for SkyServer

## Overview
Implement technical SEO improvements to maximize Google ranking potential. This covers structured data, meta tags, sitemap, semantic HTML, and crawlability -- all achievable within a React SPA.

## Changes

### 1. Add JSON-LD Structured Data (`index.html`)
Embed three structured data blocks directly in the HTML head:
- **Organization schema**: Name, URL, logo, social links (Discord)
- **WebSite schema**: Name, URL, search action potential
- **FAQ schema**: All 9 FAQ items marked up for Google's rich snippet carousel

This is the single highest-impact SEO change -- FAQ rich snippets can dramatically increase click-through rate.

### 2. Expand Sitemap (`public/sitemap.xml`)
Add all public routes with proper priorities:
- `/` (1.0), `/help` (0.7), `/terms` (0.5), `/imprint` (0.5), `/register` (0.8), `/login` (0.6)
- Add `lastmod` dates to all entries
- Remove `/login` priority inflation (it's not a landing page)

### 3. Add Canonical URL and Missing Meta Tags (`index.html`)
- Add `<link rel="canonical" href="https://www.skyserver1508.org/" />`
- Add `<meta property="og:url" content="https://www.skyserver1508.org/" />`
- Add `<meta name="robots" content="index, follow" />`
- Add additional keyword-rich meta description variants
- Add `<meta name="theme-color" content="...">` for mobile browser theming

### 4. Per-Page Dynamic Titles (new `src/hooks/usePageTitle.ts`)
Create a simple hook that sets `document.title` on each page:
- `/` -> "SkyServer - Free Game Server Hosting | Minecraft, Terraria, Rust & More"
- `/help` -> "Help Center - SkyServer | Game Server Guides & Tutorials"
- `/terms` -> "Terms of Service - SkyServer"
- `/imprint` -> "Imprint - SkyServer"
- `/register` -> "Sign Up - SkyServer | Get Your Free Game Server"
- `/login` -> "Login - SkyServer"
- `/dashboard` -> "Dashboard - SkyServer"

Apply the hook in each page component.

### 5. Add `<noscript>` Fallback (`index.html`)
Add a `<noscript>` block inside `<body>` with:
- The site name and key description text
- Links to main pages
- This gives crawlers that don't run JS something to index

### 6. Improve Semantic HTML in Hero Section (`src/components/landing/HeroSection.tsx`)
- Update H1 to be more keyword-targeted: include "Free Minecraft Server Hosting" or "Free Game Server Hosting - SkyServer"
- Ensure the subtext paragraph includes natural keyword variations (free server hosting, Terraria, Rust, CS2, Factorio)

### 7. Update robots.txt (`public/robots.txt`)
- Add `Sitemap: https://www.skyserver1508.org/sitemap.xml` directive so crawlers auto-discover the sitemap

### 8. Improve Link Structure in Footer (`src/components/layout/Footer.tsx`)
- Ensure all internal links use descriptive anchor text (already mostly good)
- Add `rel="noopener noreferrer"` on external links (already done)

## Files to modify
1. `index.html` -- Structured data, canonical URL, meta tags, noscript fallback
2. `public/sitemap.xml` -- Expand with all public routes
3. `public/robots.txt` -- Add sitemap directive
4. `src/hooks/usePageTitle.ts` -- New hook for dynamic page titles
5. `src/pages/Index.tsx` -- Apply page title
6. `src/pages/Help.tsx` -- Apply page title
7. `src/pages/Login.tsx` -- Apply page title
8. `src/pages/Register.tsx` -- Apply page title
9. `src/pages/Terms.tsx` -- Apply page title
10. `src/pages/Imprint.tsx` -- Apply page title
11. `src/pages/Dashboard.tsx` -- Apply page title
12. `src/pages/Admin.tsx` -- Apply page title
13. `src/pages/NotFound.tsx` -- Apply page title
14. `src/components/landing/HeroSection.tsx` -- Keyword-optimize H1 and subtext

## What this WON'T fix (outside Lovable's control)
- **Server-side rendering**: SPAs are inherently harder to rank. Consider Lovable's published URL or a CDN with prerendering if rankings plateau.
- **OG image**: You need a proper 1200x630 PNG/JPG social share image. Upload one to `/public/og-image.png` and I'll wire it up.
- **Backlinks**: The #1 off-page factor. Get listed on game server directories, Reddit communities, and gaming forums.
- **Page speed**: Already good since it's a Vite SPA, but consider lazy-loading below-fold sections.
- **Google Search Console**: Submit the updated sitemap there manually after publishing.

