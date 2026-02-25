'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  targetType: 'POST' | 'COMMENT';
  targetId: number;
};

export function ReportButton({ targetType, targetId }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!reason.trim()) return;

    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId, reason }),
    });

    if (res.ok) {
      setSubmitted(true);
      setShowForm(false);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to report');
    }
  }

  if (submitted) {
    return <span className="text-xs text-gray-400">Reported</span>;
  }

  return (
    <>
      <button
        onClick={() => {
          if (!user) { router.push('/login'); return; }
          setShowForm(!showForm);
        }}
        className="text-xs text-gray-400 hover:text-red-500"
      >
        Report
      </button>
      {showForm && (
        <div className="mt-1 space-y-1">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you reporting this?"
            rows={2}
            className="w-full rounded border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
          />
          <div className="flex gap-1">
            <button
              onClick={handleSubmit}
              className="rounded bg-red-500 px-2 py-0.5 text-xs text-white"
            >
              Submit
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-gray-500"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </>
  );
}
