'use client';

type Props = {
  sort: 'best' | 'new';
  onChange: (sort: 'best' | 'new') => void;
};

export function CommentSortToggle({ sort, onChange }: Props) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange('best')}
        className={`rounded px-3 py-1 text-sm ${
          sort === 'best'
            ? 'bg-foreground text-background'
            : 'text-gray-500 hover:text-foreground'
        }`}
      >
        Best
      </button>
      <button
        onClick={() => onChange('new')}
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
