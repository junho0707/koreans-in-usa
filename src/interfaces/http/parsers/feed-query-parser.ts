import { FeedFilters } from '@/src/domain/feed';

export function parseFeedQuery(searchParams: URLSearchParams): FeedFilters {
  const sort = searchParams.get('sort');
  const type = searchParams.get('type');
  const limit = searchParams.get('limit');

  return {
    sort: sort === 'new' ? 'new' : 'top12h',
    state: searchParams.get('state') ?? undefined,
    region: searchParams.get('region') ?? undefined,
    topic: searchParams.get('topic') ?? undefined,
    type: type ? (type.toLowerCase() as FeedFilters['type']) : undefined,
    limit: limit ? Number(limit) : undefined,
    cursor: searchParams.get('cursor') ?? undefined,
  };
}
