'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  targetType: 'POST' | 'COMMENT';
  targetId: number;
};

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate', label: 'Hate speech' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
];

export function ReportButton({ targetType, targetId }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!selectedReason) return;

    const reason = selectedReason === 'other'
      ? details.trim() || 'Other'
      : `${REPORT_REASONS.find((r) => r.value === selectedReason)?.label}${details.trim() ? `: ${details.trim()}` : ''}`;

    setSubmitting(true);
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
    setSubmitting(false);
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
        <div className="mt-2 rounded-lg border p-3 dark:border-gray-700">
          <p className="mb-2 text-xs font-medium">Why are you reporting this?</p>
          <div className="mb-2 space-y-1">
            {REPORT_REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-2 text-xs">
                <input
                  type="radio"
                  name={`report-${targetType}-${targetId}`}
                  value={r.value}
                  checked={selectedReason === r.value}
                  onChange={() => setSelectedReason(r.value)}
                  className="accent-red-500"
                />
                {r.label}
              </label>
            ))}
          </div>
          {selectedReason && (
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={selectedReason === 'other' ? 'Please describe the issue...' : 'Additional details (optional)'}
              rows={2}
              className="mb-2 w-full rounded border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!selectedReason || submitting}
              className="rounded bg-red-500 px-3 py-1 text-xs text-white disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              onClick={() => { setShowForm(false); setSelectedReason(''); setDetails(''); }}
              className="text-xs text-gray-500"
            >
              Cancel
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </>
  );
}
