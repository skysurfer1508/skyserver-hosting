
# Email Verification & Password Reset System

## Overview
Implement a complete email verification guard, password reset flow, and sign-up updates -- all routing through your custom domain `https://www.skyserver1508.org`.

---

## What Already Exists
- `RESEND_API_KEY` secret is already configured
- Auth system with `useAuth` hook, sign-up/sign-in flows
- Profile completion modal (blocks dashboard until name is set)
- `profiles.is_verified` column synced via `handle_verification_update` trigger

## What Will Be Built

### 1. Sign-Up Flow Update (`Register.tsx`)
- Change `emailRedirectTo` from `window.location.origin` to `https://www.skyserver1508.org/dashboard`
- Update the `signUp` function in `useAuth.tsx` to accept and forward the redirect URL
- After successful sign-up, show toast: "Please check your email to verify your account." and redirect to `/login` instead of `/dashboard`

### 2. Email Verification Guard Component
**New file: `src/components/EmailVerificationGuard.tsx`**

- Wraps dashboard content inside `ProtectedRoute`
- Checks `session.user.email_confirmed_at`
- If `null`, renders a blocking "Verification Required" screen instead of the dashboard:
  - Displays the user's current email
  - "Resend Verification Email" button that calls `supabase.auth.resend()` with `emailRedirectTo: 'https://www.skyserver1508.org/dashboard'`
  - Email correction input field so users can fix typos (calls `supabase.auth.updateUser({ email: newEmail })` then re-sends verification)
  - Cooldown timer on resend button to prevent spam

**Integration:** Wrap `<Dashboard />` inside `<EmailVerificationGuard>` in `App.tsx`

### 3. Password Reset Flow

**New file: `src/pages/ForgotPassword.tsx`** (route: `/auth/forgot-password`)
- Email input form
- On submit: `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://www.skyserver1508.org/auth/update-password' })`
- Success message: "Check your email for a password reset link."

**New file: `src/pages/UpdatePassword.tsx`** (route: `/auth/update-password`)
- New password + confirm password form
- On submit: `supabase.auth.updateUser({ password })` then redirect to `/dashboard`
- Handles the auth token from the URL automatically (Supabase injects session from the email link)

**Route additions in `App.tsx`:**
```
/auth/forgot-password -> ForgotPassword
/auth/update-password -> UpdatePassword
```

**Login page update:** Add a "Forgot password?" link below the sign-in form

### 4. Resend Email Configuration (Edge Function)
The project already has the `RESEND_API_KEY` secret. Supabase's built-in auth emails (verification, password reset) use the configured SMTP/email provider. Since you're using Supabase Auth's native `resend()` and `resetPasswordForEmail()` methods, the emails go through Supabase's auth system -- no custom edge function is needed for sending these emails.

However, if you want branded emails from your `skyserver1508.org` domain, you'll need to configure the email templates in the auth settings. This can be done via the `config.toml` or through the backend settings.

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/EmailVerificationGuard.tsx` | Blocks unverified users from dashboard |
| `src/pages/ForgotPassword.tsx` | Password reset request page |
| `src/pages/UpdatePassword.tsx` | New password entry page |

### Files to Modify
| File | Change |
|------|--------|
| `src/App.tsx` | Add routes, wrap Dashboard with guard |
| `src/hooks/useAuth.tsx` | Update `signUp` redirect URL |
| `src/pages/Register.tsx` | Update post-signup behavior and toast |
| `src/pages/Login.tsx` | Add "Forgot password?" link |

### Auth Flow Diagram

```text
Sign Up -> Toast "Check email" -> Redirect to /login
                |
                v
        Email verification link -> skyserver1508.org/dashboard
                |
                v
        Login -> EmailVerificationGuard checks email_confirmed_at
                |
        +-------+--------+
        |                 |
    Verified          Not Verified
        |                 |
        v                 v
    Dashboard       Blocking Screen
                    - Show email
                    - Resend button
                    - Fix email input

Forgot Password -> /auth/forgot-password -> email link
                                              |
                                              v
                            skyserver1508.org/auth/update-password
                                              |
                                              v
                                        Set new password -> /dashboard
```

### No Database Changes Needed
- The `profiles.is_verified` column and `handle_verification_update` trigger already exist
- Email verification is handled by Supabase Auth's built-in `email_confirmed_at` field
- Password reset uses Supabase Auth's native flow (no custom tokens table needed for this)
