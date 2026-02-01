---
description: Steps to remember when deploying the clinic-system to a new domain
---

# Deployment Checklist for Clinic System

When deploying to a new domain (e.g., sehatech.com, clinic.example.com), remember these steps:

## 1. Supabase Configuration

### Site URL (Authentication)
- Go to: https://supabase.com/dashboard/project/wyaulspqvkrwgzivsqeb/auth/url-configuration
- Update **Site URL** to your production domain (e.g., `https://sehatech.com`)

### Redirect URLs (Authentication)
Add these patterns for your new domain:
- `https://yourdomain.com/**`
- `https://yourdomain.com/en/reset-password`
- `https://yourdomain.com/ar/reset-password`
- `https://yourdomain.com/tr/reset-password`

**Currently configured:**
- `http://localhost:3000/**`
- `http://localhost:3000/en/reset-password`
- `http://localhost:3001/**`
- `https://clinic-system-eta.vercel.app/**`
- `https://*.vercel.app/**`

## 2. Environment Variables

Update these in your hosting provider (Vercel, etc.):
- `NEXT_PUBLIC_SUPABASE_URL` - Keep the same
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Keep the same
- Add any new environment-specific variables

## 3. Email Templates

If using custom domain, update email templates in Supabase:
- Go to: https://supabase.com/dashboard/project/wyaulspqvkrwgzivsqeb/auth/templates
- Update password reset email template if needed

## 4. DNS & SSL

- Configure DNS to point to your hosting provider
- Ensure SSL certificate is properly configured

## 5. LemonSqueezy Webhooks (Billing)

If using billing, update webhook URLs in LemonSqueezy dashboard to use new domain.
