

## Fix: Send All Auth Emails via Resend from Your Custom Domain

### The Root Problem

The calls to `supabase.auth.signUp()`, `supabase.auth.resend()`, and `supabase.auth.resetPasswordForEmail()` all trigger Supabase's **built-in** email system, which sends from `no-reply@auth.lovable.cloud` and uses the Lovable project URL. The `emailRedirectTo` parameter cannot override this -- it's a Supabase platform-level setting you don't have access to change.

### The Solution

Bypass Supabase's built-in email sending entirely. Instead, use your `send-auth-email` edge function (which uses Resend) for **all** auth emails. The edge function will use `admin.generateLink()` with the service role key to create proper Supabase verification/recovery links, rewrite them to point to `skyserver1508.org`, and send them via Resend.

---

### Step-by-step Changes

**1. Rewrite the `send-auth-email` Edge Function**

The current edge function just sends static HTML with no real auth tokens. It needs to be completely rewritten to:

- Accept `{ type: "signup" | "recovery", email: string }`
- Use `supabase.auth.admin.generateLink()` with the service role key to create a real Supabase auth link (this generates the proper token)
- Replace the Lovable project domain in the generated link with `https://www.skyserver1508.org`
- Send the email via Resend from `noreply@skyserver1508.org`
- For signup type, also set `email_confirmed_at = null` to ensure the user must verify (needed if auto-confirm is on)

**2. Enable Auto-Confirm on Signup**

Use the configure-auth tool to enable auto-confirm. This **prevents** Supabase from sending its default email on signup. Without this, users would receive two emails -- one from `auth.lovable.cloud` (unwanted) and one from Resend (wanted).

With auto-confirm enabled, the user is immediately "confirmed" by Supabase, but the edge function will immediately nullify `email_confirmed_at`, forcing them to verify via the Resend email.

**3. Update the Signup Flow (`Register.tsx` + `useAuth.tsx`)**

After `signUp()` succeeds:
- Call the `send-auth-email` edge function with `{ type: "signup", email }` to send the custom verification email
- Navigate to `/login` with the existing "check your email" toast

**4. Update the Verification Guard (`EmailVerificationGuard.tsx`)**

Replace `supabase.auth.resend()` with a call to the `send-auth-email` edge function:
```
supabase.functions.invoke('send-auth-email', {
  body: { type: 'signup', email: user.email }
})
```

**5. Update the Forgot Password Page (`ForgotPassword.tsx`)**

Replace `supabase.auth.resetPasswordForEmail()` with a call to the edge function:
```
supabase.functions.invoke('send-auth-email', {
  body: { type: 'recovery', email }
})
```

**6. No Changes Needed to `UpdatePassword.tsx`**

The generated recovery link will redirect to `https://www.skyserver1508.org/auth/update-password` with the proper token in the URL fragment. The existing `onAuthStateChange` listener for `PASSWORD_RECOVERY` will handle it correctly.

---

### Technical Details

#### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/send-auth-email/index.ts` | Complete rewrite: use `admin.generateLink()` + domain rewriting + Resend |
| `src/pages/Register.tsx` | Call edge function after signup to send custom email |
| `src/components/EmailVerificationGuard.tsx` | Replace `supabase.auth.resend()` with edge function call |
| `src/pages/ForgotPassword.tsx` | Replace `supabase.auth.resetPasswordForEmail()` with edge function call |

#### Auth Configuration
- Enable auto-confirm via configure-auth tool (prevents default Supabase emails)

#### Edge Function Flow

```text
Frontend calls send-auth-email edge function
  --> Edge function creates Supabase admin client (service role)
  --> Calls admin.generateLink({ type, email, options: { redirectTo } })
  --> Gets the generated link (e.g., https://<project>.supabase.co/auth/v1/verify?token=...)
  --> Replaces domain with https://www.skyserver1508.org (the token params stay the same)
  --> Sends email via Resend from noreply@skyserver1508.org
  --> For signup: also calls admin.updateUserById() to set email_confirmed_at = null
  --> Returns success
```

#### Domain Rewriting Logic (in edge function)

The `admin.generateLink()` returns a link like:
```
https://ccomlhxhigqqmoexpmyy.supabase.co/auth/v1/verify?token=abc123&type=signup&redirect_to=...
```

The edge function extracts the token parameters and constructs a link that goes through Supabase's auth verification endpoint but with the correct redirect. The key insight is that the verification link itself must still point to Supabase's `/auth/v1/verify` endpoint (it processes the token), but the `redirect_to` parameter inside it controls where the user ends up after verification.

So the rewriting ensures `redirect_to=https://www.skyserver1508.org/dashboard` (for signup) or `redirect_to=https://www.skyserver1508.org/auth/update-password` (for recovery).

