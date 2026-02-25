import { compareFeedItems, FeedItem } from '@/src/domain/entities/feed-item';
import { RegionId } from '@/src/domain/entities/post';

function inLast12Hours(createdAtIso: string, nowIso: string): boolean {
  const now = new Date(nowIso).getTime();
  const createdAt = new Date(createdAtIso).getTime();
  return createdAt >= now - 12 * 60 * 60 * 1000;
}

function top3PerRegion(posts: FeedItem[]): FeedItem[] {
  const grouped = new Map<RegionId, FeedItem[]>();
  for (const post of posts) {
    if (!post.regionId) continue;
    const regionPosts = grouped.get(post.regionId) ?? [];
    regionPosts.push(post);
    regionPosts.sort(compareFeedItems);
    grouped.set(post.regionId, regionPosts.slice(0, 3));
  }

  return [...grouped.values()].flat();
}

export function buildUsaCandidatePool(posts: FeedItem[], nowIso: string): FeedItem[] {
  const recent = posts.filter((post) => inLast12Hours(post.createdAt, nowIso));

  const scopeUsa = recent.filter((post) => post.scopeUsa);
  const regional = top3PerRegion(recent.filter((post) => post.scopeRegion));

  const unique = new Map<number, FeedItem>();
  for (const post of [...scopeUsa, ...regional]) {
    unique.set(post.id, post);
  }

  return [...unique.values()].sort(compareFeedItems);
}
