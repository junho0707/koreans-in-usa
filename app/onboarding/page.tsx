'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [identity, setIdentity] = useState('');
  const [saving, setSaving] = useState(false);

  if (loading) return <div className="mx-auto max-w-md px-4 py-16">Loading...</div>;
  if (!user) { router.push('/login'); return null; }

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  }

  async function handleComplete() {
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName || undefined,
          profileState: state || undefined,
          city: city || undefined,
          interests: interests.length > 0 ? interests : undefined,
          koreanXIdentity: identity || undefined,
        }),
      });
      router.push('/');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-2xl font-bold">Welcome!</h1>
      <p className="mb-8 text-gray-500">Let&apos;s set up your profile. You can always change this later.</p>

      {/* Progress */}
      <div className="mb-8 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-foreground' : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">What should we call you?</h2>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={user.displayName || 'Display name'}
            className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
          />
          <h2 className="pt-2 text-lg font-semibold">Where are you located?</h2>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">Select region</option>
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (optional)"
            className="w-full rounded-lg border px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
          />
          <button onClick={() => setStep(2)} className="w-full rounded-lg bg-foreground py-3 text-background">
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">What are you interested in?</h2>
          <p className="text-sm text-gray-500">Select as many as you like</p>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  interests.includes(interest)
                    ? 'bg-foreground text-background'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 rounded-lg border py-3 dark:border-gray-700">
              Back
            </button>
            <button onClick={() => setStep(3)} className="flex-1 rounded-lg bg-foreground py-3 text-background">
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">How do you identify?</h2>
          <p className="text-sm text-gray-500">This helps us connect you with the right community</p>
          <div className="space-y-2">
            {IDENTITY_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setIdentity(identity === opt ? '' : opt)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                  identity === opt
                    ? 'border-foreground bg-gray-50 font-medium dark:bg-gray-800'
                    : 'hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 rounded-lg border py-3 dark:border-gray-700">
              Back
            </button>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="flex-1 rounded-lg bg-foreground py-3 text-background disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Complete'}
            </button>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full text-center text-sm text-gray-500 hover:text-foreground"
          >
            Skip for now
          </button>
        </div>
      )}
    </main>
  );
}
