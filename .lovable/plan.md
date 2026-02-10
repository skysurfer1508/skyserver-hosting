

# Add "Resend Verification Email" Option on Login Error

## What Changes

When a player tries to log in and gets the "Email not confirmed" error, the login page will show a helpful message with a button to resend the verification email -- instead of just a generic error toast.

## How It Works

1. After a failed login attempt, detect if the error message contains "Email not confirmed"
2. Instead of only showing a toast, display an inline alert below the form with:
   - A clear message: "Your email hasn't been verified yet"
   - A "Resend Verification Email" button
3. Clicking the button calls the existing `send-auth-email` edge function (type: `signup`) with the entered email
4. Show a success toast when the email is sent

## Technical Details

### File: `src/pages/Login.tsx`

- Add state: `showEmailNotConfirmed` (boolean) and `isResending` (boolean)
- In `handleSubmit`, check if `error.message` includes "Email not confirmed":
  - If yes, set `showEmailNotConfirmed = true` instead of showing a generic toast
  - If no, show the normal error toast as before
- Add a `handleResendVerification` function that calls `supabase.functions.invoke('send-auth-email', { body: { type: 'signup', email } })`
- Render a conditional alert/banner below the form when `showEmailNotConfirmed` is true, containing the resend button
- Reset `showEmailNotConfirmed` to false when the user changes their email input

| File | Action |
|------|--------|
| `src/pages/Login.tsx` | Add email-not-confirmed detection and resend verification UI |

