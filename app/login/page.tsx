'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type Tab = 'signin' | 'signup';

export default function LoginPage() {
  const { supabase, user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('signin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Sign In fields
  const [identifier, setIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up fields
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{ available?: boolean; reason?: string } | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Live username availability check
  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus(null);
      return;
    }
    setCheckingUsername(true);
    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      setUsernameStatus(data);
    } catch {
      setUsernameStatus(null);
    }
    setCheckingUsername(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (signUpUsername) checkUsername(signUpUsername);
    }, 400);
    return () => clearTimeout(timer);
  }, [signUpUsername, checkUsername]);

  async function handleGoogleLogin() {
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      let email = identifier.trim();

      // If not an email, resolve username to email
      if (!email.includes('@')) {
        const res = await fetch('/api/auth/resolve-identifier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email }),
        });
        if (!res.ok) {
          setError('User not found');
          setLoading(false);
          return;
        }
        const data = await res.json();
        email = data.email;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: signInPassword,
      });

      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (usernameStatus && !usernameStatus.available) {
      setError(usernameStatus.reason ?? 'Username unavailable');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        data: { username: signUpUsername.toLowerCase() },
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setMessage('Check your email to confirm your account!');
    }
    setLoading(false);
  }

  if (user) return null;

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-2xl font-bold">Welcome</h1>
      <p className="mb-8 text-gray-500">Join the Korean community in the USA</p>

      {/* Google OAuth */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 font-medium transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-4 text-gray-500">or</span>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => { setTab('signin'); setError(''); setMessage(''); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === 'signin'
              ? 'bg-foreground text-background'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setTab('signup'); setError(''); setMessage(''); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === 'signup'
              ? 'bg-foreground text-background'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Sign Up
        </button>
      </div>

      {tab === 'signin' ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="mb-1 block text-sm font-medium">
              Email or Username
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              placeholder="you@example.com or username"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="signin-password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="signin-password"
              type="password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-foreground px-4 py-2 text-background disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm">
            <a href="/login/forgot-password" className="text-blue-600 hover:underline dark:text-blue-400">
              Forgot password?
            </a>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="signup-email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="signup-username" className="mb-1 block text-sm font-medium">
              Username
            </label>
            <input
              id="signup-username"
              type="text"
              value={signUpUsername}
              onChange={(e) => setSignUpUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              placeholder="your_username"
              autoComplete="username"
              minLength={3}
              maxLength={20}
            />
            {checkingUsername && (
              <p className="mt-1 text-xs text-gray-400">Checking...</p>
            )}
            {!checkingUsername && usernameStatus && signUpUsername.length >= 3 && (
              <p className={`mt-1 text-xs ${usernameStatus.available ? 'text-green-600' : 'text-red-500'}`}>
                {usernameStatus.available ? 'Available!' : usernameStatus.reason}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="signup-password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading || (usernameStatus !== null && !usernameStatus.available)}
            className="w-full rounded-lg bg-foreground px-4 py-2 text-background disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      )}

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <p className="mt-8 text-center text-xs text-gray-400">
        By signing in, you agree to our{' '}
        <a href="/guidelines" className="underline hover:text-foreground">Community Guidelines</a>
      </p>
    </main>
  );
}
