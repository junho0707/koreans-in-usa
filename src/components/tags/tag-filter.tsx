'use client';

type Props = {
  tags: string[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
};

export function TagFilter({ tags, selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
          !selected
            ? 'bg-foreground text-background'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag === selected ? null : tag)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            tag === selected
              ? 'bg-foreground text-background'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
