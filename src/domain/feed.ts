import { FeedItem } from '@/src/domain/entities/feed-item';

export type FeedSort = 'top12h' | 'new';

export type FeedFilters = {
  state?: string;
  region?: string;
  topic?: string;
  type?: 'qa' | 'tip' | 'general';
  sort?: FeedSort;
  limit?: number;
  cursor?: string;
};

export type FeedPage = {
  items: FeedItem[];
  nextCursor: string | null;
};

export function normalizeLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit)) return 30;
  return Math.max(1, Math.min(limit, 50));
}
