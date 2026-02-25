'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type AuthMethod = 'email' | 'phone';

export default function LoginPage() {
  const { supabase, user } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (user) {
    router.push('/');
    return null;
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setMessage('Check your email for the magic link!');
    }
    setLoading(false);
  }

  async function handlePhoneLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error: authError } = await supabase.auth.signInWithOtp({ phone });

    if (authError) {
      setError(authError.message);
    } else {
      router.push(`/login/verify?phone=${encodeURIComponent(phone)}`);
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-2xl font-bold">Sign In</h1>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setMethod('email')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            method === 'email'
              ? 'bg-foreground text-background'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setMethod('phone')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            method === 'phone'
              ? 'bg-foreground text-background'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Phone
        </button>
      </div>

      {method === 'email' ? (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-foreground px-4 py-2 text-background disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      ) : (
        <form onSubmit={handlePhoneLogin} className="space-y-4">
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              placeholder="+1234567890"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-foreground px-4 py-2 text-background disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </main>
  );
}
