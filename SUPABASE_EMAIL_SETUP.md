# Supabase Email Configuration Guide

## Error: "Error sending confirmation email"

This error occurs when Supabase cannot send confirmation emails. Follow these steps to fix it:

## Option 1: Configure Supabase Email Settings (Recommended)

### Step 1: Enable Email Confirmation

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication → Settings**
4. Under **Email Auth**, ensure:
   - ✅ "Enable email confirmations" is **ON**
   - ✅ "Enable email signup" is **ON**

### Step 2: Configure Site URL and Redirect URLs

1. In **Authentication → URL Configuration**:
   - **Site URL**: Set to `http://localhost:3000` (for development) or your production URL
   - **Redirect URLs**: Add these URLs:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback` (for production)

### Step 3: Configure SMTP (Choose one)

#### Option A: Use Supabase Default Email Service (Free Tier - Limited)

- Supabase provides a default email service with rate limits
- For free tier: 3 emails per hour per user
- This should work out of the box, but may hit rate limits

#### Option B: Configure Custom SMTP (Recommended for Production)

1. Go to **Project Settings → Auth → SMTP Settings**
2. Enable "Enable Custom SMTP"
3. Configure your SMTP provider:

   **For Resend (Recommended):**
   - SMTP Host: `smtp.resend.com`
   - SMTP Port: `465` (SSL) or `587` (TLS)
   - SMTP User: `resend`
   - SMTP Password: Your Resend API key (from `.env` file)
   - Sender Email: Your verified domain email (e.g., `noreply@yourdomain.com`)
   - Sender Name: `Yetti AI`

   **For Gmail:**
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - SMTP User: Your Gmail address
   - SMTP Password: App-specific password (not your regular password)
   - Sender Email: Your Gmail address

   **For SendGrid:**
   - SMTP Host: `smtp.sendgrid.net`
   - SMTP Port: `587`
   - SMTP User: `apikey`
   - SMTP Password: Your SendGrid API key
   - Sender Email: Your verified sender email

### Step 4: Customize Email Templates (Optional)

1. Go to **Authentication → Email Templates**
2. Customize the "Confirm signup" template
3. Ensure the confirmation link uses: `{{ .ConfirmationURL }}`

## Option 2: Disable Email Confirmation (Development Only)

⚠️ **Warning**: Only use this for development/testing. Never use in production!

1. Go to **Authentication → Settings**
2. Turn **OFF** "Enable email confirmations"
3. Users will be able to sign in immediately without email verification

## Option 3: Use Magic Link Instead

If email confirmation is causing issues, you can use magic link authentication:

```typescript
// In lib/auth.ts, add this method:
async signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}
```

## Troubleshooting

### Check Email Rate Limits

1. Go to **Project Settings → Usage**
2. Check if you've exceeded email sending limits
3. Free tier: 3 emails/hour per user

### Verify SMTP Configuration

1. Test your SMTP settings in Supabase dashboard
2. Check SMTP logs in **Project Settings → Logs**
3. Ensure your SMTP credentials are correct

### Check Email Templates

1. Ensure email templates are enabled
2. Check that templates have valid HTML
3. Verify `{{ .ConfirmationURL }}` is in the template

### Common Issues

**Issue**: "Email rate limit exceeded"

- **Solution**: Wait or upgrade your Supabase plan

**Issue**: "SMTP authentication failed"

- **Solution**: Verify SMTP credentials are correct

**Issue**: "Invalid redirect URL"

- **Solution**: Add the redirect URL to Supabase dashboard under Authentication → URL Configuration

**Issue**: "Email not sending"

- **Solution**: Check Supabase logs, verify SMTP is configured, check spam folder

## Quick Fix for Development

If you just want to test signup without email:

1. In Supabase Dashboard → Authentication → Settings
2. Turn OFF "Enable email confirmations"
3. Users can sign in immediately after signup

Remember to turn it back ON for production!
