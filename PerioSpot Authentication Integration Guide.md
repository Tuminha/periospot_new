# PerioSpot Authentication Integration Guide

**Status:** Phase 2 - Complete ✅
**Last Updated:** January 2, 2026

---

## Overview

This guide provides complete instructions for integrating Supabase authentication into the PerioSpot frontend with support for:
- **Email/Password authentication** (conventional login)
- **Google OAuth** (third-party provider)
- **Email verification** (confirmation required)
- **Password reset** functionality
- **Session management** (JWT tokens)

---

## Part 1: Setup & Configuration

### 1.1 Environment Variables

Ensure these variables are set in `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 1.2 Install Dependencies

```bash
npm install @supabase/supabase-js
# or
pnpm add @supabase/supabase-js
```

### 1.3 Supabase Configuration Status

✅ **Email/Password:** Enabled
✅ **Google OAuth:** Enabled
✅ **Email Confirmation:** Required
✅ **User Signups:** Allowed
✅ **Manual Linking:** Enabled

---

## Part 2: Frontend Components

### 2.1 AuthContext Component

**File:** `src/components/Auth/AuthContext.tsx`

Provides authentication state and methods:

```typescript
interface AuthContextType {
  user: User | null;           // Current logged-in user
  loading: boolean;             // Loading state
  signUp: (email, password) => Promise<void>;
  signIn: (email, password) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email) => Promise<void>;
  error: string | null;         // Error messages
}
```

**Usage:**

```typescript
import { AuthProvider, useAuth } from '@/components/Auth/AuthContext';

// Wrap your app with AuthProvider
<AuthProvider>
  <App />
</AuthProvider>

// Use in components
const { user, signIn, signInWithGoogle, signOut } = useAuth();
```

### 2.2 LoginForm Component

**File:** `src/components/Auth/LoginForm.tsx`

Handles user login with two methods:

**Features:**
- Email/password login form
- Google OAuth button
- Error handling
- Loading states
- Email validation
- Password recovery link
- Sign up link

**Usage:**

```typescript
import { LoginForm } from '@/components/Auth/LoginForm';

export default function LoginPage() {
  return <LoginForm />;
}
```

### 2.3 SignupForm Component

**File:** `src/components/Auth/SignupForm.tsx`

Handles user registration with two methods:

**Features:**
- Full name input
- Email/password signup form
- Password confirmation
- Password strength validation (min 8 chars)
- Google OAuth button
- Email verification confirmation
- Sign in link

**Usage:**

```typescript
import { SignupForm } from '@/components/Auth/SignupForm';

export default function SignupPage() {
  return <SignupForm />;
}
```

---

## Part 3: Authentication Flows

### 3.1 Email/Password Sign Up Flow

```
1. User fills signup form
   - Full name
   - Email
   - Password (min 8 chars)
   - Confirm password

2. Validation
   - All fields required
   - Valid email format
   - Passwords match
   - Password length >= 8

3. Submit to Supabase
   - Create user in auth.users
   - Send confirmation email
   - Create user profile

4. Email Confirmation
   - User receives confirmation email
   - Clicks confirmation link
   - Email verified
   - Account activated

5. User can now log in
```

### 3.2 Email/Password Sign In Flow

```
1. User enters email and password

2. Validation
   - Email format valid
   - Both fields required

3. Supabase Authentication
   - Verify credentials
   - Check email confirmed
   - Generate JWT token

4. Session Created
   - Token stored in browser
   - User redirected to dashboard
   - Logged in state updated
```

### 3.3 Google OAuth Sign Up/Sign In Flow

```
1. User clicks "Sign in/up with Google"

2. Redirect to Google
   - User authenticates with Google
   - Grants permission to PerioSpot

3. Google Redirect
   - Returns authorization code
   - Redirected to callback URL

4. Supabase Exchange
   - Supabase exchanges code for tokens
   - Retrieves user info from Google
   - Creates/updates user in auth.users

5. Session Created
   - JWT token generated
   - User profile created/updated
   - Redirected to dashboard

6. Account Linking
   - If user later adds email/password
   - Both methods work for same account
```

### 3.4 Password Reset Flow

```
1. User clicks "Forgot password"

2. Enter Email
   - User enters email address
   - Validation check

3. Reset Email Sent
   - Supabase sends reset link
   - Link valid for 24 hours

4. Click Reset Link
   - User clicks link in email
   - Redirected to reset page

5. New Password
   - User enters new password
   - Password updated in Supabase

6. Sign In
   - User signs in with new password
```

---

## Part 4: Implementation Examples

### 4.1 Protected Route Component

```typescript
import { useAuth } from '@/components/Auth/AuthContext';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### 4.2 User Profile Component

```typescript
import { useAuth } from '@/components/Auth/AuthContext';

export function UserProfile() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>ID: {user?.id}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### 4.3 Conditional Rendering

```typescript
import { useAuth } from '@/components/Auth/AuthContext';

export function Header() {
  const { user } = useAuth();

  return (
    <header>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <a href="/dashboard">Dashboard</a>
        </div>
      ) : (
        <div>
          <a href="/login">Sign In</a>
          <a href="/signup">Sign Up</a>
        </div>
      )}
    </header>
  );
}
```

---

## Part 5: Routing Setup

### 5.1 React Router Configuration

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/components/Auth/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### 5.2 Auth Callback Handler

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/Auth/AuthContext';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect to dashboard after successful OAuth
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return <div>Completing sign in...</div>;
}
```

---

## Part 6: Error Handling

### 6.1 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid login credentials" | Wrong email/password | Check credentials |
| "Email not confirmed" | User hasn't verified email | Resend confirmation email |
| "User already registered" | Email exists | Use existing account or reset password |
| "Password too weak" | Password < 8 chars | Use stronger password |
| "Invalid email format" | Email validation failed | Enter valid email |
| "Passwords do not match" | Confirm password mismatch | Re-enter matching passwords |

### 6.2 Error Handling Pattern

```typescript
const handleLogin = async () => {
  try {
    await signIn(email, password);
    navigate('/dashboard');
  } catch (err: any) {
    // Error automatically set in context
    console.error('Login failed:', err.message);
    // Display error to user via component state
  }
};
```

---

## Part 7: Security Best Practices

### 7.1 Frontend Security

✅ **Use HTTPS Only**
- OAuth redirects must use HTTPS in production
- Secure cookies with HttpOnly flag

✅ **Validate Input**
- Email format validation
- Password strength requirements
- Sanitize user input

✅ **Protect Sensitive Data**
- Never log passwords
- Store tokens securely
- Use secure session storage

✅ **CSRF Protection**
- Supabase handles CSRF tokens
- Use state parameter in OAuth

### 7.2 Backend Security (Supabase)

✅ **Row Level Security (RLS)**
- Policies on database tables
- Users can only access their own data

✅ **Rate Limiting**
- Enabled on auth endpoints
- Prevents brute force attacks

✅ **Email Verification**
- Required before first login
- Confirmation links expire in 24 hours

✅ **Password Security**
- Bcrypt hashing (Supabase default)
- No plaintext passwords stored

---

## Part 8: Testing Authentication

### 8.1 Test Email/Password

**Test Account:**
```
Email: test@periospot.com
Password: TestPassword123!
```

**Steps:**
1. Go to `/signup`
2. Fill form with test account
3. Check email for confirmation link
4. Click confirmation link
5. Go to `/login`
6. Enter credentials
7. Should be logged in

### 8.2 Test Google OAuth

**Steps:**
1. Go to `/login` or `/signup`
2. Click "Sign in/up with Google"
3. Authenticate with Google account
4. Should be redirected to dashboard
5. User should be logged in

### 8.3 Test Password Reset

**Steps:**
1. Go to `/forgot-password`
2. Enter email address
3. Check email for reset link
4. Click reset link
5. Enter new password
6. Sign in with new password

---

## Part 9: Monitoring & Debugging

### 9.1 Supabase Dashboard

**View Users:**
- Go to: Authentication → Users
- See all registered users
- Check email confirmation status
- View user metadata

**View Logs:**
- Go to: Authentication → Audit Logs
- Monitor authentication events
- Track failed login attempts
- Review security incidents

### 9.2 Browser DevTools

**Check Session:**
```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser();
console.log(user);
```

**Check Token:**
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log(session?.access_token);
```

### 9.3 Common Issues

| Issue | Debug | Solution |
|-------|-------|----------|
| Google OAuth fails | Check redirect URI | Verify in Google Cloud Console |
| Email not received | Check SMTP settings | Configure email provider |
| Session expires | Check token expiry | Implement refresh token logic |
| User locked out | Check rate limits | Wait or admin unlock |

---

## Part 10: Next Steps

### Phase 3: Welcome Email System
- Create welcome email template
- Send email on signup
- Integrate with Resend

### Phase 4: User Profile Management
- Allow profile updates
- Upload profile picture
- Change password
- Delete account

### Phase 5: Advanced Features
- Two-factor authentication (2FA)
- Social account linking
- Session management
- Activity logging

---

## Checklist

- ✅ Supabase authentication configured
- ✅ Email/Password provider enabled
- ✅ Google OAuth configured
- ✅ AuthContext component created
- ✅ LoginForm component created
- ✅ SignupForm component created
- ✅ Protected routes implemented
- ✅ Error handling implemented
- ✅ Security best practices applied
- ⏳ Welcome email system (next phase)
- ⏳ User profile management (next phase)

---

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [React Router Documentation](https://reactrouter.com/)
- [Security Best Practices](https://supabase.com/docs/guides/auth/security)

---

**Status:** Phase 2 - Complete ✅
**Next Phase:** Phase 3 - Welcome Email System
