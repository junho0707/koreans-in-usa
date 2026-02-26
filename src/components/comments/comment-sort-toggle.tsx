'use client';

import { useEffect } from 'react';

type Props = {
  sort: 'best' | 'new';
  onChange: (sort: 'best' | 'new') => void;
};

export function CommentSortToggle({ sort, onChange }: Props) {
  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('commentSort');
    if (saved === 'best' || saved === 'new') {
      onChange(saved);
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(value: 'best' | 'new') {
    localStorage.setItem('commentSort', value);
    onChange(value);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleChange('best')}
        className={`rounded px-3 py-1 text-sm ${
          sort === 'best'
            ? 'bg-foreground text-background'
            : 'text-gray-500 hover:text-foreground'
        }`}
      >
        Best
      </button>
      <button
        onClick={() => handleChange('new')}
        className={`rounded px-3 py-1 text-sm ${
          sort === 'new'
            ? 'bg-foreground text-background'
            : 'text-gray-500 hover:text-foreground'
        }`}
      >
        New
      </button>
    </div>
  );
}
