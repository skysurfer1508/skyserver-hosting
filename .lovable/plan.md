

# Email Service Implementation with Resend

This plan implements a complete authentication email system using Resend, including password reset, email verification, and welcome emails.

## Overview

You'll be able to send professional authentication emails to your users, including:
- **Password Reset**: Users can request a password reset link via email
- **Email Verification**: New users receive a verification email after signing up
- **Welcome Email**: A friendly welcome message sent after successful verification

## Prerequisites

Before I can implement this, you'll need:

1. **Resend Account**: Sign up at https://resend.com if you don't have one
2. **Verified Domain**: Verify your email domain at https://resend.com/domains (required to send emails)
3. **API Key**: Create an API key at https://resend.com/api-keys

---

## Implementation Steps

### Step 1: Add Resend API Key Secret

I'll request your Resend API key and store it securely as a backend secret.

### Step 2: Create Edge Functions

**Three new backend functions will be created:**

```text
supabase/functions/
├── send-password-reset/index.ts     (Password reset emails)
├── send-verification-email/index.ts (Email verification)
└── send-welcome-email/index.ts      (Welcome message)
```

Each function will:
- Accept email and relevant data
- Use Resend to send beautifully formatted emails
- Return success/error responses

### Step 3: Create Password Reset Flow

**New UI Components:**
- "Forgot Password?" link on the Login page
- Password Reset Request page (`/forgot-password`)
- Reset Password page (`/reset-password`) for setting new password

**Flow:**
1. User clicks "Forgot Password?" on login page
2. User enters email and clicks "Send Reset Link"
3. Backend function sends email with secure reset link
4. User clicks link, gets redirected to reset password page
5. User sets new password and can log in

### Step 4: Enable Email Verification

**Changes to Registration:**
- After signup, user is shown a "Check your email" message
- User receives verification email with confirmation link
- User must verify before they can fully access the dashboard
- Welcome email is sent after successful verification

### Step 5: Database Updates

**New table for password reset tokens:**

```text
password_reset_tokens
├── id (uuid, primary key)
├── user_id (uuid, references profiles)
├── token (text, unique)
├── expires_at (timestamptz)
└── created_at (timestamptz)
```

### Step 6: Update Config

Add new edge functions to the backend configuration with proper security settings.

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/send-password-reset/index.ts` | Create | Send password reset emails |
| `supabase/functions/send-verification-email/index.ts` | Create | Send email verification links |
| `supabase/functions/send-welcome-email/index.ts` | Create | Send welcome emails |
| `supabase/config.toml` | Update | Register new edge functions |
| `src/pages/ForgotPassword.tsx` | Create | Password reset request page |
| `src/pages/ResetPassword.tsx` | Create | Set new password page |
| `src/pages/VerifyEmail.tsx` | Create | Email verification landing page |
| `src/pages/Login.tsx` | Update | Add "Forgot Password?" link |
| `src/pages/Register.tsx` | Update | Show verification message after signup |
| `src/App.tsx` | Update | Add new routes |
| `src/hooks/useAuth.tsx` | Update | Add password reset methods |

---

## Technical Details

### Edge Function: Password Reset

```typescript
// Generates secure token, stores in database, sends email
POST /send-password-reset
Body: { email: string }

// Email contains link like:
// https://yourapp.com/reset-password?token=abc123
```

### Edge Function: Email Verification

```typescript
// Sends verification link using Supabase's built-in magic link
POST /send-verification-email  
Body: { email: string }
```

### Edge Function: Welcome Email

```typescript
// Sends welcome message after verification
POST /send-welcome-email
Body: { email: string, name: string }
```

### Security Measures

- Password reset tokens expire after 1 hour
- Tokens are single-use and deleted after use
- Rate limiting on email sending
- Secure token generation using crypto

---

## User Experience Flow

```text
REGISTRATION:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Sign Up    │───▶│ Check Email  │───▶│   Verified   │
│   (Form)     │    │  (Message)   │    │  (Dashboard) │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ▼
                    [Verification Email]
                           │
                           ▼
                    [Welcome Email]


PASSWORD RESET:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    Login     │───▶│   Forgot     │───▶│    Reset     │
│ (Forgot Pwd) │    │  Password    │    │   Password   │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ▼
                    [Reset Email Sent]
```

---

## Next Steps After Approval

1. I'll first ask you to provide the Resend API key
2. Then implement all the edge functions
3. Create the new pages and update existing ones
4. Add the database table for reset tokens
5. Test the complete flow

