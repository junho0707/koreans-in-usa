'use client';

const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

type Props = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZES = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-12 w-12 text-sm',
};

export function Avatar({ name, size = 'md', className = '' }: Props) {
  const color = getColorFromName(name);
  const initials = getInitials(name);
  const sizeClass = SIZES[size];

  return (
    <div
      className={`flex items-center justify-center rounded-full font-medium text-white ${color} ${sizeClass} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}
