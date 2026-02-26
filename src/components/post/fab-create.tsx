'use client';

import { useAuth } from '@/src/components/providers/auth-context';

type Props = {
  onClick: () => void;
};

export function FabCreate({ onClick }: Props) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 rounded-full bg-foreground p-4 text-background shadow-lg transition hover:opacity-80 md:hidden"
      aria-label="Create new post"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}
