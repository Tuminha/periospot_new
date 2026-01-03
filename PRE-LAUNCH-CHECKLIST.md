# Periospot Pre-Launch Checklist

## Current Status: 85% Ready

### What's Complete and Working
- [x] Blog system (84 posts migrated)
- [x] Products listing (69 products)
- [x] Authentication (login, signup, Google OAuth, password reset)
- [x] Contact form (with email notifications)
- [x] Newsletter signup (with Resend)
- [x] Typeform assessments (11 assessments)
- [x] YouTube embeds fixed (244 videos)
- [x] Social media links configured
- [x] SEO (structured data, sitemap, robots.txt)
- [x] Legal pages (privacy, terms, cookies)
- [x] Team page with contact form
- [x] Search functionality
- [x] WordPress URL redirects

### What's NOT Complete (But Optional for Launch)
- [ ] Shopping Cart (UI exists, no backend)
- [ ] Checkout/Stripe integration (UI exists, no payment processing)
- [ ] Admin analytics (uses mock data)

---

## CRITICAL TASKS (Must Do Before Launch)

### 1. Test the Staging Site
Go to: https://periospot-new.vercel.app

- [ ] Homepage loads correctly
- [ ] Blog listing works
- [ ] Individual blog posts load with images
- [ ] Products/tienda page works
- [ ] Product detail pages load
- [ ] Assessments page shows all 11 assessments
- [ ] Individual assessment Typeforms load
- [ ] Search works
- [ ] Newsletter signup works
- [ ] Contact form submits successfully
- [ ] Login/signup works
- [ ] Password reset flow works
- [ ] Mobile responsive (test on phone)

### 2. Fix Hardcoded Emails
Update these files with correct emails:

**File: `src/app/api/contact/route.ts` line 64**
```typescript
// Change from:
to: "cisco@periospot.com"

// Change to (both emails for notifications):
to: ["cisco@periospot.com", "periospot@periospot.com"]
```

### 3. Environment Variables in Vercel
Add these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://periospot.com
```

**Already set (verify they exist):**
```
NEXT_PUBLIC_SUPABASE_URL=https://ajueupqlrodkhfgkegnx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
```

### 4. Update Supabase Auth URLs
In Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: https://periospot.com
Redirect URLs:
  - https://periospot.com/auth/callback
  - https://periospot.com/login
  - https://periospot.com/signup
  - https://periospot.com/reset-password
```

### 5. Update Google OAuth (if using Google login)
In Google Cloud Console → APIs & Credentials:

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

## IMPORTANT TASKS (Do Within First Week)

### 6. Verify Email Domain in Resend
So emails come from `@periospot.com` instead of Resend's default domain.

Add DNS records from Resend dashboard for:
- `resend._domainkey.periospot.com`
- SPF record

### 7. Submit Sitemap to Google
After DNS is switched:
1. Go to Google Search Console
2. Submit: `https://periospot.com/sitemap.xml`
3. Request indexing for key pages

### 8. Test All Forms in Production
After launch, test:
- [ ] Newsletter signup sends welcome email
- [ ] Contact form sends notifications to both emails
- [ ] Password reset sends email
- [ ] Sign up sends confirmation email

---

## OPTIONAL (Can Do Later)

### Shopping Cart & Checkout
Currently, the cart and checkout have UI but no backend. Options:

**Option A: Keep products informational only**
- Products show info but no "buy" button
- Direct users to contact for purchases

**Option B: Link to external checkout**
- Keep WooCommerce for checkout temporarily
- "Buy Now" links to WooCommerce product page

**Option C: Implement full checkout (Future)**
- Add cart context/store
- Integrate Stripe
- Build order management

### Admin Analytics
Currently uses mock data. Can implement real analytics later:
- Vercel Analytics (built-in)
- Google Analytics
- Custom Supabase analytics

---

## LAUNCH DAY QUICK CHECKLIST

### Morning
- [ ] Backup WordPress site completely
- [ ] Verify Vercel production build is working
- [ ] Test staging site one more time

### DNS Change (takes 2-48 hours)
- [ ] Update A record: `@` → `76.76.21.21`
- [ ] Update CNAME: `www` → `cname.vercel-dns.com`

### After DNS Propagates
- [ ] Site loads on periospot.com
- [ ] HTTPS working (green lock)
- [ ] Test login/signup
- [ ] Test newsletter signup
- [ ] Test contact form
- [ ] Check blog posts
- [ ] Check assessments
- [ ] Test on mobile

### Post-Launch (First Week)
- [ ] Monitor Vercel logs for errors
- [ ] Check for 404s in Vercel Analytics
- [ ] Add any missing redirects
- [ ] Submit sitemap to Google
- [ ] Announce on social media

---

## DECISION REQUIRED: Shopping Cart

**Current State:** Cart and checkout pages exist with UI, but:
- "Add to Cart" buttons don't work
- No cart persistence
- No payment processing

**Recommendation for Launch:**

Remove or hide the cart functionality temporarily:

1. **Option A - Remove "Add to Cart" buttons** (safest)
   - Change product pages to show "Contact for Purchase" instead
   - Hide cart icon from header

2. **Option B - Link to WooCommerce** (if keeping WordPress)
   - "Buy Now" → links to `https://periospot.com/producto/slug`
   - Keep WooCommerce running for orders

3. **Option C - Launch with broken cart** (not recommended)
   - Users will click "Add to Cart" and nothing happens
   - Bad user experience

**Which would you prefer?**

---

## Files Reference

| File | What to Check/Update |
|------|---------------------|
| `src/app/api/contact/route.ts:64` | Add second email for notifications |
| `src/components/ContactForm.tsx` | Working, no changes needed |
| `src/app/api/newsletter/route.ts` | Working, no changes needed |
| `src/app/tienda/[slug]/page.tsx:272` | "Add to Cart" button decision |
| `src/app/cart/page.tsx` | Hide or update based on decision |
| `src/app/checkout/page.tsx` | Hide or update based on decision |
| `next.config.ts` | Redirects already configured |

---

## Estimated Timeline

| Task | Time |
|------|------|
| Test staging site | 30 min |
| Fix hardcoded email | 5 min |
| Set Vercel env vars | 10 min |
| Update Supabase URLs | 5 min |
| Update Google OAuth | 10 min |
| DNS change | 5 min |
| DNS propagation | 2-48 hours |
| Post-launch testing | 1 hour |

**Total active work: ~2 hours**
**Total elapsed time: 1-2 days (DNS propagation)**

---

*Last updated: January 3, 2026*
