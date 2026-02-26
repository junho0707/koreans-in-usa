'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const REGIONS = [
  { id: 'NE', label: 'Northeast' },
  { id: 'S', label: 'South' },
  { id: 'MW', label: 'Midwest' },
  { id: 'W', label: 'West' },
];

const INTEREST_OPTIONS = [
  'Immigration', 'Jobs & Career', 'Housing', 'Education',
  'Food & Dining', 'Healthcare', 'Finance & Tax', 'Parenting',
  'Culture', 'Travel', 'Technology', 'Business',
];

const IDENTITY_OPTIONS = [
  'Korean American', 'Korean Immigrant', 'International Student',
  'Temporary Worker', 'Permanent Resident', 'Korean Expat',
];

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [profileState, setProfileState] = useState('');
  const [city, setCity] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [koreanXIdentity, setKoreanXIdentity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
          setCity(u.city ?? '');
          setInterests(u.interests ?? []);
          setKoreanXIdentity(u.koreanXIdentity ?? '');
        });
    }
  }, [user]);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName,
        profileState: profileState || null,
        city: city || null,
        interests: interests.length > 0 ? interests : [],
        koreanXIdentity: koreanXIdentity || null,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push('/profile'), 1000);
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
    <main className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium">
            Display Name *
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={50}
            className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
          <p className="mt-1 text-xs text-gray-400">{displayName.length}/50</p>
        </div>

        <div>
          <label htmlFor="profileState" className="mb-1 block text-sm font-medium">
            Region
          </label>
          <select
            id="profileState"
            value={profileState}
            onChange={(e) => setProfileState(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">Select region</option>
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
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
            placeholder="e.g. Los Angeles, New York"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  interests.includes(interest)
                    ? 'bg-foreground text-background'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          {interests.length > 0 && (
            <p className="mt-2 text-xs text-gray-400">{interests.length} selected</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Korean Identity</label>
          <div className="space-y-2">
            {IDENTITY_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setKoreanXIdentity(koreanXIdentity === opt ? '' : opt)}
                className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition ${
                  koreanXIdentity === opt
                    ? 'border-foreground bg-gray-50 font-medium dark:bg-gray-800'
                    : 'hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Profile updated! Redirecting...</p>}

        <button
          type="submit"
          disabled={saving || !displayName.trim()}
          className="w-full rounded-lg bg-foreground px-4 py-2.5 text-background disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </main>
  );
}
