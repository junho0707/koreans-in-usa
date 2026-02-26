'use client';

import { useState } from 'react';

type Props = {
  warning: string;
  children: React.ReactNode;
};

export function ContentWarning({ warning, children }: Props) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-6 text-center dark:border-yellow-700 dark:bg-yellow-900/20">
      <svg className="mx-auto mb-2 h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p className="mb-1 font-medium text-yellow-800 dark:text-yellow-200">Content Warning</p>
      <p className="mb-4 text-sm text-yellow-700 dark:text-yellow-300">{warning}</p>
      <button
        onClick={() => setRevealed(true)}
        className="rounded-lg bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
      >
        Show Content
      </button>
    </div>
  );
}
