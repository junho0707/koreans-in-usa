'use client';

import Link from 'next/link';

export function CommunityInfo() {
  return (
    <div className="rounded-lg border p-4 dark:border-gray-800">
      <h3 className="mb-2 text-sm font-semibold">About This Community</h3>
      <p className="mb-3 text-xs text-gray-500 leading-relaxed">
        A space for Koreans living in the United States to share
        information, ask questions, and connect with each other.
      </p>
      <div className="space-y-1 text-xs text-gray-500">
        <Link href="/guidelines" className="block hover:text-foreground">
          Community Guidelines
        </Link>
        <Link href="/tags" className="block hover:text-foreground">
          Browse Topics
        </Link>
      </div>
    </div>
  );
}
