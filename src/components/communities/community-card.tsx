'use client';

import Link from 'next/link';

type Props = {
  community: {
    name: string;
    slug: string;
    description: string | null;
    memberCount: number;
    scope: string;
    privacy: string;
  };
};

const SCOPE_LABELS: Record<string, string> = {
  usa: 'USA',
  region: 'Region',
};

export default function CommunityCard({ community }: Props) {
  const truncatedDescription =
    community.description && community.description.length > 100
      ? community.description.slice(0, 100) + '...'
      : community.description;

  return (
    <Link
      href={`/communities/${community.slug}`}
      className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {community.name}
        </h3>
        <div className="flex gap-1.5 shrink-0 ml-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {SCOPE_LABELS[community.scope] ?? community.scope}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              community.privacy === 'public'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            }`}
          >
            {community.privacy === 'public' ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
      {truncatedDescription && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {truncatedDescription}
        </p>
      )}
      <div className="text-xs text-gray-500 dark:text-gray-500">
        {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
      </div>
    </Link>
  );
}
