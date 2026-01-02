# Periospot Migration - API Credentials & Setup Guide

## Overview
This document contains all the API credentials and configuration needed for the periospot-new project. **Keep this file secure and never commit it to version control.**

---

## 1. Supabase Configuration

### Project Details
- **Project Name:** periospot
- **Project ID:** ajueupqlrodkhfgkegnx
- **Project URL:** https://your-project.supabase.co

### API Keys
- **Publishable Key (Anon Key):** `your_anon_key_here`
  - Use in browser/frontend code
  - Safe to expose publicly (with Row Level Security enabled)
  
- **Secret Key (Service Role):** `your_service_role_key_here`
  - Use only on backend/server
  - Keep this secret!

### Environment Variables for Frontend
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Environment Variables for Backend/Server
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Database Tables Created
- assessment_attempts
- assessments
- choices
- media
- newsletter_subscribers
- pages
- posts
- products
- profiles
- questions
- redirects
- responses
- result_screens

---

## 2. Resend Email Service

### Project Details
- **Project Name:** periospot-new
- **Account Email:** cisco@periospot.com

### API Key
- **API Key:** `your_resend_api_key_here`
  - Full access permissions
  - All domains enabled

### Environment Variable
```env
VITE_RESEND_API_KEY=your_resend_api_key_here
```

### Usage
Use this API key to send emails via Resend:
- Newsletter emails
- User notifications
- Assessment result emails
- Password reset emails

---

## 3. Vercel Deployment

### Project Details
- **Project Name:** periospot-new
- **Team:** Tuminha's projects (Hobby)
- **Repository:** https://github.com/Tuminha/periospot_new
- **Status:** Ready for deployment

### Deployment URL
- **Production URL:** https://periospot-new.vercel.app (once deployed)
- **Preview URLs:** Generated automatically for each PR

### Environment Variables to Add in Vercel
1. Go to: https://vercel.com/tuminhas-projects/periospot-new/settings/environment-variables
2. Add the following variables for **All Environments**:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
VITE_RESEND_API_KEY=your_resend_api_key_here
VITE_APP_URL=https://periospot-new.vercel.app
VITE_API_URL=https://periospot-new.vercel.app/api
```

---

## 4. Google OAuth (To Be Configured)

### Setup Steps
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback`
   - `https://periospot-new.vercel.app/auth/callback`
6. Copy Client ID and Client Secret

### Environment Variables
```env
VITE_GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
VITE_GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>
```

---

## 5. WooCommerce API (To Be Configured)

### Setup Steps
1. Log in to WordPress admin: https://periospot.com/wp-admin
2. Go to: WooCommerce → Settings → Advanced → REST API
3. Create a new API key with:
   - Description: "Periospot Migration"
   - User: Your admin account
   - Permissions: Read/Write
4. Copy Consumer Key and Consumer Secret

### Environment Variables
```env
VITE_WOOCOMMERCE_URL=https://periospot.com
VITE_WOOCOMMERCE_CONSUMER_KEY=<YOUR_CONSUMER_KEY>
VITE_WOOCOMMERCE_CONSUMER_SECRET=<YOUR_CONSUMER_SECRET>
```

---

## 6. Local Development Setup

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Tuminha/periospot_new.git
   cd periospot_new
   ```

2. Create `.env.local` file in the root directory with the credentials from `.env.vercel`

3. Install dependencies:
   ```bash
   cd frontend/periospot-vite
   npm install
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open browser: http://localhost:5173

---

## 7. Deployment to Vercel

### Prerequisites
- Code pushed to GitHub main branch
- Environment variables configured in Vercel

### Steps
1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. Vercel will automatically:
   - Detect the push
   - Build the project
   - Deploy to production

3. Monitor deployment: https://vercel.com/tuminhas-projects/periospot-new/deployments

---

## 8. Security Checklist

- [ ] `.env.local` is added to `.gitignore`
- [ ] Never commit credentials to GitHub
- [ ] Supabase service role key is only used on backend
- [ ] Resend API key is kept secure
- [ ] Google OAuth credentials are protected
- [ ] WooCommerce API credentials are rotated regularly
- [ ] Vercel environment variables are marked as sensitive where applicable

---

## 9. Troubleshooting

### Supabase Connection Issues
- Verify Project URL and API keys are correct
- Check Row Level Security (RLS) policies on tables
- Ensure database is not paused

### Resend Email Issues
- Verify API key is correct and has full access
- Check email domain is verified
- Review Resend logs: https://resend.com/logs

### Vercel Deployment Issues
- Check build logs: https://vercel.com/tuminhas-projects/periospot-new/deployments
- Verify environment variables are set correctly
- Ensure GitHub repository is connected

---

## 10. Next Steps

1. **Configure Google OAuth** - Set up authentication
2. **Configure WooCommerce API** - Connect to product catalog
3. **Set up 301 redirects** - Maintain SEO rankings
4. **Migrate content** - Import posts, pages, and products
5. **Test locally** - Run `npm run dev` and verify functionality
6. **Deploy to Vercel** - Push to main branch
7. **Monitor performance** - Check Vercel Analytics and Speed Insights

---

**Last Updated:** January 2, 2026
**Status:** ✅ Ready for Development
