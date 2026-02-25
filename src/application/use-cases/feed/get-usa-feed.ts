import { GetFeedRequest } from '@/src/application/dto/feed-request';
import { FeedRepository } from '@/src/application/ports/feed-repository';

export async function getUsaFeed(repo: FeedRepository, request: GetFeedRequest) {
  return repo.getUsaFeed(request);
}
