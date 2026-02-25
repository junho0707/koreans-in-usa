'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [profileState, setProfileState] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [interests, setInterests] = useState('');
  const [koreanXIdentity, setKoreanXIdentity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/profile')
        .then((r) => r.json())
        .then((data) => {
          const u = data.user;
          setDisplayName(u.displayName ?? '');
          setProfileState(u.profileState ?? '');
          setCountry(u.country ?? '');
          setCity(u.city ?? '');
          setInterests(u.interests?.join(', ') ?? '');
          setKoreanXIdentity(u.koreanXIdentity ?? '');
        });
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName,
        profileState: profileState || null,
        country: country || null,
        city: city || null,
        interests: interests
          ? interests.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        koreanXIdentity: koreanXIdentity || null,
      }),
    });

    if (res.ok) {
      router.push('/profile');
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to update profile');
    }
    setSaving(false);
  }

  if (authLoading || !user) {
    return <div className="mx-auto max-w-lg px-4 py-16">Loading...</div>;
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-8 text-2xl font-bold">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium">
            Display Name *
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        <div>
          <label htmlFor="profileState" className="mb-1 block text-sm font-medium">
            State
          </label>
          <input
            id="profileState"
            value={profileState}
            onChange={(e) => setProfileState(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            placeholder="e.g. CA, NY"
          />
        </div>

        <div>
          <label htmlFor="country" className="mb-1 block text-sm font-medium">
            Country
          </label>
          <input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium">
            City
          </label>
          <input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        <div>
          <label htmlFor="interests" className="mb-1 block text-sm font-medium">
            Interests (comma-separated)
          </label>
          <input
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            placeholder="visa, housing, jobs"
          />
        </div>

        <div>
          <label htmlFor="koreanXIdentity" className="mb-1 block text-sm font-medium">
            Korean Identity
          </label>
          <input
            id="koreanXIdentity"
            value={koreanXIdentity}
            onChange={(e) => setKoreanXIdentity(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            placeholder="e.g. Korean-American, expat, student"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </main>
  );
}
