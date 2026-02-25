type Props = {
  tag: string;
  onClick?: () => void;
};

export function TagBadge({ tag, onClick }: Props) {
  return (
    <span
      onClick={onClick}
      className={`rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400 ${
        onClick ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700' : ''
      }`}
    >
      {tag}
    </span>
  );
}
