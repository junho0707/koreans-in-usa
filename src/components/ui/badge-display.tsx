'use client';

type Props = {
  reputation: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
};

const BADGES = [
  { min: 1000, name: 'Legend', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: '★' },
  { min: 500, name: 'Expert', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', icon: '◆' },
  { min: 100, name: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: '●' },
  { min: 20, name: 'Contributor', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: '▲' },
  { min: 0, name: 'Newcomer', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: '○' },
];

export function getBadge(reputation: number) {
  return BADGES.find((b) => reputation >= b.min) ?? BADGES[BADGES.length - 1];
}

export function BadgeDisplay({ reputation, showLabel = true, size = 'sm' }: Props) {
  const badge = getBadge(reputation);

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-medium ${badge.color} ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
      title={`${badge.name} - ${reputation} reputation`}
    >
      <span>{badge.icon}</span>
      {showLabel && <span>{badge.name}</span>}
    </span>
  );
}
