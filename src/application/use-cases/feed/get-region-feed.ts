import { GetFeedRequest } from '@/src/application/dto/feed-request';
import { FeedRepository } from '@/src/application/ports/feed-repository';

export async function getRegionFeed(
  repo: FeedRepository,
  regionSlug: string,
  request: GetFeedRequest,
) {
  return repo.getRegionFeed(regionSlug, request);
}
