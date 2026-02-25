'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function VerifyForm() {
  const { supabase } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') ?? '';
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-4 text-2xl font-bold">Verify OTP</h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Enter the code sent to {phone}
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="token" className="mb-1 block text-sm font-medium">
            Verification Code
          </label>
          <input
            id="token"
            type="text"
            inputMode="numeric"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            placeholder="123456"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16">Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
