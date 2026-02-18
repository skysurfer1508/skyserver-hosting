

# Update Favicon and SEO Icons

## Summary
Replace the current favicon with the uploaded logo and add proper SEO icon tags for Google, Apple devices, and social media previews.

## Changes

### 1. Copy the uploaded icon to the public directory
- Copy `user-uploads://icon.ico` to `public/logo.png` (for use in meta tags)
- The existing `public/icon.ico` will also be kept as fallback

### 2. Update `index.html` head section
- Replace `<link rel="icon" href="/icon.ico" />` with:
  - `<link rel="icon" href="/logo.png" type="image/png">`
  - `<link rel="apple-touch-icon" href="/logo.png">`
- Update all `og:image` meta tags to point to `https://www.skyserver1508.org/logo.png`
- Update `twitter:image` to the same URL
- Update the JSON-LD Organization `logo` field to match

### 3. Note on image size
- The uploaded `.ico` file will be copied as-is. For best Google compatibility, the icon should be a multiple of 48px (e.g., 96x96, 144x144). If the current file doesn't meet that, you may want to upload a properly sized PNG version later.
- For a high-quality Open Graph banner (1200x630px for Discord/WhatsApp previews), you would need to provide a separate banner image. For now, the logo will be used as the `og:image`.

