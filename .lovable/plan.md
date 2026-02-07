
# Plan: Fix Dockerfile npm Install Error

## Problem
The Docker build is failing because `npm ci` requires an exact match between `package.json` and `package-lock.json`. If the lockfile is out of sync or missing, the build fails.

## Solution
Update the Dockerfile to be more resilient:

1. **Remove redundant lockfile copy** - The `COPY package*.json ./` already copies both `package.json` and `package-lock.json` (if present), so the separate `COPY package-lock.json ./` line is redundant and will fail if the lockfile doesn't exist.

2. **Switch from `npm ci` to `npm install`** - This is more forgiving and will work even if the lockfile is missing or slightly out of sync.

---

## Changes

### File: `Dockerfile`

**Lines 6-11** - Update the package copy and install section:

```dockerfile
# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install
```

This removes the explicit `COPY package-lock.json ./` line (since `package*.json` already handles it) and changes `npm ci` to `npm install`.

---

## Technical Notes

- `npm install` will regenerate or update the lockfile if needed, making it more flexible for CI/CD environments
- The `package*.json` glob pattern already matches both `package.json` and `package-lock.json`
- No changes needed for `NODE_ENV` since the build happens before the production stage and devDependencies are needed for `npm run build`
