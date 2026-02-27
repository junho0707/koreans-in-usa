import { GetFeedRequest } from '@/src/application/dto/feed-request';
import { LandingSummary } from '@/src/application/dto/landing-summary';
import { FeedPage } from '@/src/domain/feed';

export interface FeedRepository {
  getUsaFeed(request: GetFeedRequest): Promise<FeedPage>;
  getRegionFeed(regionSlug: string, request: GetFeedRequest): Promise<FeedPage>;
  getLandingSummary(): Promise<LandingSummary>;
}
