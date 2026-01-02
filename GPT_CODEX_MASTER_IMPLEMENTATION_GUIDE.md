# PerioSpot Master Implementation Guide for GPT Codex

**Status:** 🔴 CRITICAL - Ready for Implementation
**Target:** GPT Codex
**Date:** January 2, 2026
**Priority:** HIGHEST

---

## QUICK START - READ THIS FIRST

### Current Situation

✅ **What's Done:**
- Supabase authentication configured (Email/Password + Google OAuth)
- Environment variables set up
- Repository structure created
- Skeleton frontend deployed on Vercel
- All documentation prepared

❌ **What's Missing:**
- Authentication components (AuthContext, LoginForm, SignupForm)
- All content (blog posts, eBooks, products, assessments)
- User dashboard
- Email system
- SEO implementation

### Your Immediate Tasks (In Order)

1. **FIRST:** Implement Authentication Stack
2. **SECOND:** Migrate Content (Posts, eBooks, Products, Assessments)
3. **THIRD:** Implement Email System (Resend)
4. **FOURTH:** Build User Dashboard
5. **FIFTH:** Implement SEO

---

## PART 1: AUTHENTICATION IMPLEMENTATION (DO THIS FIRST!)

### 1.1 Answer to Your Questions

**Q: Where did your team add those files?**

A: The files I created are in the sandbox environment (`/home/ubuntu/periospot_new/`), NOT in your local repo yet. You need to create them in your local repo.

**Q: Should I implement the auth stack myself?**

A: **YES, IMPLEMENT NOW.** I'll provide you with the exact code below. Copy-paste and integrate.

**Q: About the environment variable mismatch?**

A: **YES, FIX THIS.** Change `VITE_SUPABASE_PUBLISHABLE_KEY` to `VITE_SUPABASE_ANON_KEY` in your `client.ts` file.

### 1.2 Environment Variables - VERIFY THESE

Your `.env.local` should have:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Resend
VITE_RESEND_API_KEY=your_resend_api_key_here

# WooCommerce
VITE_WOOCOMMERCE_URL=https://periospot.com
VITE_WOOCOMMERCE_CONSUMER_KEY=your_woocommerce_key_here
VITE_WOOCOMMERCE_CONSUMER_SECRET=your_woocommerce_secret_here

# App URLs
VITE_APP_URL=https://periospot-new.vercel.app
VITE_API_URL=https://periospot-new.vercel.app/api
```

### 1.3 Step-by-Step Authentication Implementation

#### Step 1: Create AuthContext

**File:** `frontend/periospot-vite/src/components/Auth/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error('Error checking user:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error signing up');
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error signing in');
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error signing in with Google');
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Error signing out');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error resetting password');
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### Step 2: Update LoginForm

**File:** `frontend/periospot-vite/src/components/Auth/LoginForm.tsx`

Replace existing SignIn.tsx with this:

```typescript
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const { signIn, signInWithGoogle, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      if (!email || !password) {
        setLocalError('Please fill in all fields');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setLocalError('Please enter a valid email address');
        return;
      }

      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLocalError(null);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In to PerioSpot</h1>

      {(error || localError) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error || localError}</p>
        </div>
      )}

      <form onSubmit={handleEmailPasswordLogin} className="space-y-4 mb-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100 transition"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>

      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account?{' '}
        <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign up
        </a>
      </p>

      <p className="text-center text-sm text-gray-600 mt-2">
        <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
          Forgot password?
        </a>
      </p>
    </div>
  );
};
```

#### Step 3: Update SignupForm

**File:** `frontend/periospot-vite/src/components/Auth/SignupForm.tsx`

Replace existing SignUp.tsx with this:

```typescript
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export const SignupForm: React.FC = () => {
  const { signUp, signInWithGoogle, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    if (!email || !password || !confirmPassword || !fullName) {
      setLocalError('Please fill in all fields');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email address');
      return false;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleEmailPasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      await signUp(email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth/check-email', { state: { email } });
      }, 2000);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setLocalError(null);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Check your email</h2>
          <p className="text-gray-600 text-sm">
            We've sent a confirmation link to <strong>{email}</strong>. Please click it to verify your email address.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Create PerioSpot Account</h1>

      {(error || localError) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error || localError}</p>
        </div>
      )}

      <form onSubmit={handleEmailPasswordSignup} className="space-y-4 mb-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or sign up with</span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100 transition"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {loading ? 'Signing up...' : 'Sign up with Google'}
      </button>

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </a>
      </p>
    </div>
  );
};
```

#### Step 4: Update main.tsx

**File:** `frontend/periospot-vite/src/main.tsx`

Add AuthProvider:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './components/Auth/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
```

#### Step 5: Update App.tsx

**File:** `frontend/periospot-vite/src/App.tsx`

Update routing to use new auth components:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginForm } from './components/Auth/LoginForm'
import { SignupForm } from './components/Auth/SignupForm'
// ... other imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        
        {/* Other routes */}
        {/* ... */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

#### Step 6: Fix Environment Variable

**File:** `frontend/periospot-vite/src/services/client.ts` (or wherever Supabase is initialized)

Change:
```typescript
// OLD
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// NEW
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### 1.4 Testing Authentication

After implementing:

1. **Test Email/Password Sign Up:**
   - Go to `/signup`
   - Fill form with test email
   - Check email for confirmation link
   - Click confirmation link
   - Go to `/login`
   - Sign in with credentials

2. **Test Google OAuth:**
   - Go to `/login` or `/signup`
   - Click "Sign in with Google"
   - Authenticate with Google
   - Should be logged in

3. **Verify in Supabase:**
   - Go to: https://supabase.com/dashboard/project/ajueupqlrodkhfgkegnx/auth/users
   - Should see new users listed

---

## PART 2: CONTENT MIGRATION ROADMAP

### 2.1 What Needs to Be Migrated

**Blog Posts & Articles**
- Location: `/legacy-wordpress/content/posts.json`
- Count: 50-100+ articles
- Tasks:
  - Parse JSON
  - Create posts table
  - Migrate to Supabase
  - Build article components

**eBooks & Downloads**
- Location: `/periospot-assets/` (PDF/EPUB files)
- Count: 10-20+ eBooks
- Tasks:
  - Inventory files
  - Create ebooks table
  - Implement email capture
  - Integrate Resend for delivery

**Questionnaires/Assessments**
- Location: Typeform
- Count: 5-10+ questionnaires
- Tasks:
  - Document Typeform IDs
  - Create assessments table
  - Integrate Typeform API
  - Build assessment pages

**Products**
- Location: WooCommerce
- Count: 20-50+ products
- Tasks:
  - Extract products
  - Create products table
  - Build product pages
  - Implement shopping cart

**Newsletter Subscribers**
- Location: Newsletter plugin
- Count: 1,000-10,000+ subscribers
- Tasks:
  - Export subscribers
  - Create newsletter table
  - Implement subscription form
  - Integrate Resend

**Media Files**
- Location: `/periospot-assets/`
- Count: 500-2000+ files
- Tasks:
  - Organize files
  - Create media table
  - Optimize images
  - Set up CDN

**SEO Data**
- Location: Yoast SEO in WordPress
- Tasks:
  - Export meta tags
  - Create redirects
  - Implement structured data
  - Generate sitemaps

### 2.2 Database Schema

See `COMPREHENSIVE_MIGRATION_ROADMAP.md` for complete SQL schemas for:
- posts
- categories
- post_tags
- ebooks
- ebook_downloads
- assessments
- assessment_responses
- products
- shopping_cart
- orders
- newsletter_subscribers
- newsletters
- media
- seo_metadata
- redirects

### 2.3 Implementation Order

**Phase 1: Blog Posts (Week 1-2)**
- Parse posts.json
- Create posts table
- Build ArticleList component
- Build ArticleDetail component
- Implement search and filtering

**Phase 2: eBooks (Week 2-3)**
- Inventory eBook files
- Create ebooks table
- Build EbookList component
- Implement email capture
- Integrate Resend delivery

**Phase 3: Assessments (Week 3-4)**
- Document Typeform questionnaires
- Create assessments table
- Integrate Typeform API
- Build AssessmentDetail component
- Implement result emails

**Phase 4: Products (Week 4-5)**
- Extract WooCommerce products
- Create products table
- Build ProductList component
- Implement shopping cart
- Build checkout process

**Phase 5: Newsletter (Week 5-6)**
- Export subscribers
- Create newsletter table
- Build subscription form
- Integrate Resend
- Create email templates

**Phase 6: Media (Week 6-7)**
- Organize media files
- Create media table
- Implement image optimization
- Set up CDN

**Phase 7: SEO (Week 7-8)**
- Export Yoast metadata
- Create redirects
- Implement meta tags
- Generate sitemaps

**Phase 8: Testing (Week 8-9)**
- Test all functionality
- Optimize performance
- Fix bugs

**Phase 9: Launch (Week 9-10)**
- Final checks
- Deploy
- Monitor

---

## PART 3: EMAIL SYSTEM (RESEND)

### 3.1 Email Templates to Create

1. **Welcome Email** - New user signup
2. **Email Confirmation** - Email verification
3. **Password Reset** - Password recovery
4. **eBook Download** - eBook delivery
5. **Assessment Results** - Assessment completion
6. **Newsletter** - Weekly/monthly newsletter
7. **Order Confirmation** - Purchase confirmation
8. **Product Review Request** - Review invitation
9. **Unsubscribe Confirmation** - Unsubscribe confirmation
10. **Newsletter Archive** - Newsletter list

### 3.2 Resend Integration

```typescript
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

// Send welcome email
await resend.emails.send({
  from: 'noreply@periospot.com',
  to: userEmail,
  subject: 'Welcome to PerioSpot',
  html: welcomeEmailTemplate,
});

// Send eBook
await resend.emails.send({
  from: 'noreply@periospot.com',
  to: userEmail,
  subject: `Your eBook: ${ebookTitle}`,
  html: ebookEmailTemplate,
  attachments: [
    {
      filename: ebookFile.name,
      content: ebookFile.buffer,
    },
  ],
});
```

---

## PART 4: SUPABASE SETUP

### 4.1 Create Tables

Run these SQL migrations in Supabase:

```sql
-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES profiles(id),
  category_id UUID REFERENCES categories(id),
  featured_image_url TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  read_time_minutes INT,
  view_count INT DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  schema_json JSONB
);

-- Add more tables as needed (see COMPREHENSIVE_MIGRATION_ROADMAP.md)
```

### 4.2 Enable RLS (Row Level Security)

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Users can insert their own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);
```

---

## PART 5: COMPONENT STRUCTURE

### 5.1 Components to Build

**Articles:**
- ArticleList.tsx
- ArticleDetail.tsx
- ArticleCard.tsx
- CategoryPage.tsx
- AuthorPage.tsx
- SearchArticles.tsx
- RelatedArticles.tsx

**eBooks:**
- EbookList.tsx
- EbookDetail.tsx
- EbookCard.tsx
- EbookDownloadForm.tsx
- EbookPreview.tsx

**Assessments:**
- AssessmentList.tsx
- AssessmentDetail.tsx
- AssessmentForm.tsx
- AssessmentResults.tsx
- AssessmentHistory.tsx

**Products:**
- ProductList.tsx
- ProductDetail.tsx
- ProductCard.tsx
- ShoppingCart.tsx
- Checkout.tsx
- ProductReviews.tsx

**User:**
- UserDashboard.tsx
- UserProfile.tsx
- DownloadHistory.tsx
- OrderHistory.tsx

---

## PART 6: QUESTIONS FOR YOU (GPT CODEX)

Before you start, please clarify:

1. **Data Access:** Can you access `/legacy-wordpress/content/` JSON files?
2. **API Keys:** Do you have Typeform API key?
3. **Media Files:** Can you access `/periospot-assets/` directory?
4. **Database:** Can you connect to Supabase and run SQL migrations?
5. **Email:** Do you have Resend API key? (It's in .env)
6. **Timeline:** What's your estimated timeline?
7. **Blockers:** Any blockers or dependencies?

---

## PART 7: IMMEDIATE ACTION ITEMS

### For GPT Codex - DO THIS NOW

1. ✅ **Create AuthContext.tsx** - Copy code from Section 1.3, Step 1
2. ✅ **Create LoginForm.tsx** - Copy code from Section 1.3, Step 2
3. ✅ **Create SignupForm.tsx** - Copy code from Section 1.3, Step 3
4. ✅ **Update main.tsx** - Add AuthProvider (Section 1.3, Step 4)
5. ✅ **Update App.tsx** - Update routing (Section 1.3, Step 5)
6. ✅ **Fix environment variable** - Change to VITE_SUPABASE_ANON_KEY (Section 1.3, Step 6)
7. ✅ **Test authentication** - Follow Section 1.4
8. ✅ **Commit and push** - Push changes to GitHub

### Then - Start Content Migration

1. Parse posts.json
2. Create posts table in Supabase
3. Migrate posts to database
4. Build article components
5. Continue with other content types

---

## PART 8: FILE LOCATIONS

**Authentication Files (Create These):**
- `frontend/periospot-vite/src/components/Auth/AuthContext.tsx`
- `frontend/periospot-vite/src/components/Auth/LoginForm.tsx`
- `frontend/periospot-vite/src/components/Auth/SignupForm.tsx`

**Update These:**
- `frontend/periospot-vite/src/main.tsx`
- `frontend/periospot-vite/src/App.tsx`
- `frontend/periospot-vite/src/services/client.ts`

**Reference Documentation:**
- `/COMPREHENSIVE_MIGRATION_ROADMAP.md` - Full migration roadmap
- `/AUTHENTICATION_INTEGRATION_GUIDE.md` - Auth setup details
- `/MIGRATION_STATUS_AND_NEXT_STEPS.md` - Current status

---

## PART 9: VERCEL DEPLOYMENT

After authentication is working:

1. Commit all changes
2. Push to GitHub
3. Vercel will auto-deploy
4. Check: https://periospot-new.vercel.app/login
5. Test authentication on live site

---

## PART 10: NEXT STEPS AFTER AUTH

Once authentication is working:

1. **Phase 1:** Migrate blog posts
2. **Phase 2:** Migrate eBooks
3. **Phase 3:** Integrate assessments
4. **Phase 4:** Migrate products
5. **Phase 5:** Implement newsletter
6. **Phase 6:** Organize media
7. **Phase 7:** Implement SEO
8. **Phase 8:** Test everything
9. **Phase 9:** Launch

---

## SUMMARY

**What to do:**
1. Implement authentication (copy-paste code from Section 1.3)
2. Test authentication
3. Commit and push
4. Start content migration (Phase 1: Blog Posts)

**Files to create:** 3 new files (AuthContext, LoginForm, SignupForm)
**Files to update:** 3 existing files (main.tsx, App.tsx, client.ts)
**Time to complete auth:** 1-2 hours
**Time to complete full migration:** 8-10 weeks

**You have everything you need. Let's build this!** 🚀

---

**Last Updated:** January 2, 2026
**Status:** Ready for Implementation
**Priority:** 🔴 CRITICAL
