import { Post } from '@/src/domain/entities/post';

export type FeedItem = Post & { score: number };

export function compareFeedItems(a: FeedItem, b: FeedItem): number {
  if (b.score !== a.score) return b.score - a.score;
  if (b.createdAt !== a.createdAt) return b.createdAt.localeCompare(a.createdAt);
  return b.id - a.id;
}
