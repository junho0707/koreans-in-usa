'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const REGIONS = [
  { value: 'NE', label: 'Northeast' },
  { value: 'S', label: 'South' },
  { value: 'MW', label: 'Midwest' },
  { value: 'W', label: 'West' },
];

export default function CreateCommunityForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<'usa' | 'region'>('usa');
  const [regionId, setRegionId] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [kakaoLink, setKakaoLink] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const nameValid = name.trim().length >= 3 && name.trim().length <= 50;
  const descValid = description.length <= 500;
  const regionValid = scope === 'usa' || regionId !== '';
  const canSubmit = nameValid && descValid && regionValid && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setSubmitting(true);

    try {
      const body: Record<string, string> = {
        name: name.trim(),
        description: description.trim(),
        scope,
        privacy,
      };
      if (scope === 'region' && regionId) {
        body.region_id = regionId;
      }
      if (kakaoLink.trim()) {
        body.kakao_link = kakaoLink.trim();
      }

      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to create community');
        setSubmitting(false);
        return;
      }

      router.push(`/communities/${data.community.slug}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Community Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Korean Developers in NYC"
          maxLength={50}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {name.trim().length}/50 characters (minimum 3)
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this community about?"
          rows={3}
          maxLength={500}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
        />
        <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
      </div>

      {/* Scope */}
      <div>
        <label htmlFor="scope" className="block text-sm font-medium mb-1">
          Scope
        </label>
        <select
          id="scope"
          value={scope}
          onChange={(e) => {
            setScope(e.target.value as 'usa' | 'region');
            if (e.target.value === 'usa') setRegionId('');
          }}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="usa">USA-wide</option>
          <option value="region">Region-specific</option>
        </select>
      </div>

      {/* Region dropdown (conditional) */}
      {scope === 'region' && (
        <div>
          <label htmlFor="region" className="block text-sm font-medium mb-1">
            Region
          </label>
          <select
            id="region"
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a region...</option>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Privacy */}
      <div>
        <label htmlFor="privacy" className="block text-sm font-medium mb-1">
          Privacy
        </label>
        <select
          id="privacy"
          value={privacy}
          onChange={(e) => setPrivacy(e.target.value as 'public' | 'private')}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="public">Public - Anyone can join and view posts</option>
          <option value="private">Private - Requires approval to join</option>
        </select>
      </div>

      {/* KakaoTalk Link */}
      <div>
        <label htmlFor="kakaoLink" className="block text-sm font-medium mb-1">
          KakaoTalk Group Link{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="kakaoLink"
          type="url"
          value={kakaoLink}
          onChange={(e) => setKakaoLink(e.target.value)}
          placeholder="https://open.kakao.com/..."
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Creating...' : 'Create Community'}
      </button>
    </form>
  );
}
