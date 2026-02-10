

## Fix: Dashboard Accessible After Signup Before Verification

### Root Cause

When a user signs up, auto-confirm creates a session immediately. The `onAuthStateChange` listener fires, sets `user` to the new user, but the `isVerified` database check is "fire and forget" -- it hasn't completed yet. Since `isLoading` is already `false`, `ProtectedRoute` sees a valid user with `isVerified` still at its previous value (or default), allowing brief dashboard access.

### Solution

In the `onAuthStateChange` handler, immediately reset `isVerified` to `false` when a new session is detected, before the async database check runs. This guarantees the verification guard blocks access until the check completes and confirms the user is actually verified.

### File Change

**`src/hooks/useAuth.tsx`** -- In the `onAuthStateChange` callback, add `setIsVerified(false)` right before the fire-and-forget check:

```typescript
if (session?.user) {
  // Reset to false immediately — guard blocks until DB check resolves
  setIsVerified(false);
  checkAdminRole(session.user.id).then(v => isMounted && setIsAdmin(v));
  checkVerificationStatus(session.user.id).then(v => isMounted && setIsVerified(v));
} else {
  setIsAdmin(false);
  setIsVerified(false);
}
```

This single-line addition ensures the verification guard is always enforced until the database confirms the user's status, closing the race condition window entirely.

