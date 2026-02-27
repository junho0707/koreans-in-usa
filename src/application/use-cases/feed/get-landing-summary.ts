import { FeedRepository } from '@/src/application/ports/feed-repository';

export async function getLandingSummary(repo: FeedRepository) {
  return repo.getLandingSummary();
}
