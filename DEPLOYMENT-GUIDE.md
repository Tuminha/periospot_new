# Periospot Migration & Deployment Guide

## Current Status

### Completed
- [x] WordPress content migrated (84 blog posts, 69 products)
- [x] Next.js 16 app with App Router
- [x] SEO optimization with structured data (JSON-LD)
- [x] 11 Typeform assessments integrated
- [x] YouTube embeds fixed (244 videos)
- [x] Social media links configured
- [x] Email addresses updated
- [x] WordPress URL redirects configured
- [x] Build passing (170 pages generated)

### Pending Before Launch
- [ ] Deploy to Vercel (production)
- [ ] Configure custom domain
- [ ] Set up DNS records
- [ ] Configure production environment variables
- [ ] Set up Resend email domain
- [ ] Configure Stripe for payments
- [ ] Test all functionality in production

---

## Step 1: Vercel Deployment

### 1.1 Initial Deployment

The project is already linked to Vercel. Deploy to production:

```bash
cd periospot-nextjs
vercel --prod
```

Or push to your Git repository and Vercel will auto-deploy.

### 1.2 Vercel Project Settings

Go to [Vercel Dashboard](https://vercel.com/tuminha-projects/periospot-new) and configure:

1. **Settings → General**
   - Framework Preset: Next.js
   - Root Directory: `periospot-nextjs`
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **Settings → Domains**
   - Add: `periospot.com`
   - Add: `www.periospot.com`

---

## Step 2: Domain & DNS Configuration

### 2.1 Current Setup (WordPress)
Your current `periospot.com` likely points to:
- A WordPress hosting provider (Bluehost, SiteGround, etc.)
- Or a server with Apache/Nginx

### 2.2 New DNS Records for Vercel

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and update DNS:

#### Option A: Using Vercel DNS (Recommended)
Transfer your nameservers to Vercel:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

#### Option B: Keep Current DNS Provider
Add these records:

| Type  | Name | Value                          | TTL  |
|-------|------|--------------------------------|------|
| A     | @    | 76.76.21.21                    | 3600 |
| CNAME | www  | cname.vercel-dns.com           | 3600 |

### 2.3 SSL Certificate
Vercel automatically provisions SSL certificates. No action needed.

---

## Step 3: Environment Variables (Production)

Go to **Vercel Dashboard → Settings → Environment Variables** and add:

### Required Variables

```env
# Supabase (keep existing)
NEXT_PUBLIC_SUPABASE_URL=https://ajueupqlrodkhfgkegnx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4Ap1JxjMNb7CwMZIaNzKfQ_2DGTIiPk
SUPABASE_SERVICE_ROLE_KEY=sb_secret_mgKpp5PgldT4PJ59mAlqHA_woDXSMWV

# Resend Email (get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_AUDIENCE_ID=your_audience_id

# Google Auth
GOOGLE_CLIENT_ID=1093098633626-jsr9pabgqu0r6a2tu6bbp8rtnolq99o3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Site URL (update for production)
NEXT_PUBLIC_SITE_URL=https://periospot.com
```

### Optional Variables

```env
# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## Step 4: Email Configuration (Resend)

### 4.1 Verify Domain in Resend

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add domain: `periospot.com`
3. Add these DNS records:

| Type  | Name                           | Value                                    |
|-------|--------------------------------|------------------------------------------|
| TXT   | resend._domainkey             | (provided by Resend)                     |
| TXT   | @                              | v=spf1 include:_spf.resend.com ~all     |

### 4.2 Create Audience

1. Go to [Resend Audiences](https://resend.com/audiences)
2. Create audience: "Periospot Newsletter"
3. Copy the Audience ID to environment variables

### 4.3 Test Email Sending

Newsletter will send from: `newsletter@periospot.com`

---

## Step 5: Supabase Configuration

### 5.1 Update Auth Redirect URLs

In [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → URL Configuration:

```
Site URL: https://periospot.com
Redirect URLs:
  - https://periospot.com/auth/callback
  - https://periospot.com/login
  - https://periospot.com/signup
```

### 5.2 Update Google OAuth

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

**Authorized JavaScript origins:**
```
https://periospot.com
```

**Authorized redirect URIs:**
```
https://periospot.com/auth/callback
https://ajueupqlrodkhfgkegnx.supabase.co/auth/v1/callback
```

---

## Step 6: WordPress Migration Checklist

### 6.1 Before Switching DNS

1. **Backup WordPress completely**
   ```bash
   # Export database
   mysqldump -u user -p database > wordpress_backup.sql

   # Backup files
   tar -czvf wp-content-backup.tar.gz wp-content/
   ```

2. **Test new site thoroughly**
   - Visit: https://periospot-new.vercel.app
   - Check all pages load
   - Test newsletter signup
   - Test assessments
   - Check images load correctly

3. **Keep WordPress running for 30 days**
   - Set up redirect from old URLs
   - Monitor for 404 errors

### 6.2 URL Redirects Already Configured

The following redirects are in `next.config.ts`:

| Old URL                    | New URL                      |
|----------------------------|------------------------------|
| /producto/:slug            | /tienda/:slug                |
| /category/:slug            | /blog/category/:slug         |
| /shop                      | /tienda                      |

### 6.3 Additional Redirects Needed

Add these blog post redirects if URLs differ:

```javascript
// In next.config.ts redirects()
{
  source: "/implant-depth-demystified",
  destination: "/blog/implant-depth-demystified-why-position-matters",
  permanent: true,
},
```

---

## Step 7: Launch Day Checklist

### Morning (Before DNS Change)
- [ ] Final backup of WordPress
- [ ] Verify Vercel production build is working
- [ ] Test all environment variables in production
- [ ] Check SSL certificate is active on Vercel

### DNS Change
- [ ] Update A record to `76.76.21.21`
- [ ] Update CNAME for www to `cname.vercel-dns.com`
- [ ] Set TTL to 300 (5 minutes) temporarily

### After DNS Propagation (2-48 hours)
- [ ] Verify site loads on periospot.com
- [ ] Test all critical flows:
  - [ ] Blog posts load
  - [ ] Products load
  - [ ] Newsletter signup works
  - [ ] Login/signup works
  - [ ] Assessments load
  - [ ] Contact form works
- [ ] Check Google Search Console for errors
- [ ] Submit updated sitemap: https://periospot.com/sitemap.xml

### Week After Launch
- [ ] Monitor 404 errors in Vercel Analytics
- [ ] Add missing redirects as needed
- [ ] Check email deliverability
- [ ] Increase DNS TTL back to 3600

---

## Step 8: Post-Launch SEO

### 8.1 Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Verify ownership of periospot.com (if not already)
3. Submit sitemap: `https://periospot.com/sitemap.xml`
4. Monitor Coverage for errors

### 8.2 Update External Links

Update your social profiles to point to new URLs:
- LinkedIn
- Twitter/X
- Facebook
- Instagram

### 8.3 Request Indexing

For important pages, request indexing:
1. Paste URL in Search Console
2. Click "Request Indexing"

---

## Quick Reference: DNS Records Summary

```
# Vercel Hosting
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com

# Email (Resend)
TXT   resend._domainkey   (from Resend dashboard)
TXT   @                   v=spf1 include:_spf.resend.com ~all

# Email Receiving (if using custom email)
MX    @     (your email provider's MX records)
```

---

## Support & Troubleshooting

### Common Issues

1. **Images not loading**
   - Check `next.config.ts` remotePatterns includes the domain
   - Verify image URLs are HTTPS

2. **Auth not working**
   - Update Supabase redirect URLs
   - Update Google OAuth redirect URIs

3. **Email not sending**
   - Verify Resend domain
   - Check RESEND_API_KEY is set

4. **404 errors from old URLs**
   - Add redirect in `next.config.ts`
   - Redeploy to Vercel

### Useful Commands

```bash
# Check build locally
npm run build

# Deploy to production
vercel --prod

# Check Vercel logs
vercel logs

# Check DNS propagation
nslookup periospot.com
dig periospot.com
```

---

## Timeline Estimate

| Task                          | Time      |
|-------------------------------|-----------|
| Vercel deployment             | 5 min     |
| Environment variables         | 15 min    |
| DNS update                    | 10 min    |
| DNS propagation               | 2-48 hours|
| Resend domain verification    | 1-24 hours|
| Google OAuth update           | 10 min    |
| Testing                       | 1-2 hours |
| **Total**                     | ~1 day    |

---

*Last updated: January 3, 2026*
