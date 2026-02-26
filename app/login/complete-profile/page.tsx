'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function CompleteProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{ available?: boolean; reason?: string } | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already has username, redirect home
  useEffect(() => {
    if (user?.username) {
      router.push('/');
    }
  }, [user, router]);

  const checkUsername = useCallback(async (value: string) => {
    if (value.length < 3) {
      setUsernameStatus(null);
      return;
    }
    setCheckingUsername(true);
    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(value)}`);
      const data = await res.json();
      setUsernameStatus(data);
    } catch {
      setUsernameStatus(null);
    }
    setCheckingUsername(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) checkUsername(username);
    }, 400);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (usernameStatus && !usernameStatus.available) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.toLowerCase() }),
      });

      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error ?? 'Failed to set username');
      }
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  function handleSkip() {
    router.push('/');
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-2xl font-bold">Choose a Username</h1>
      <p className="mb-8 text-gray-500">
        Pick a unique username for your profile. You can change it later.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            placeholder="your_username"
            minLength={3}
            maxLength={20}
            autoFocus
          />
          {checkingUsername && (
            <p className="mt-1 text-xs text-gray-400">Checking...</p>
          )}
          {!checkingUsername && usernameStatus && username.length >= 3 && (
            <p className={`mt-1 text-xs ${usernameStatus.available ? 'text-green-600' : 'text-red-500'}`}>
              {usernameStatus.available ? 'Available!' : usernameStatus.reason}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !username || (usernameStatus !== null && !usernameStatus.available)}
          className="w-full rounded-lg bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Set Username'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSkip}
        className="mt-4 w-full text-center text-sm text-gray-500 hover:text-foreground"
      >
        Skip for now
      </button>
    </main>
  );
}
