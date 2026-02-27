import { FeedItem } from '@/src/domain/entities/feed-item';

export type RegionHeadline = {
  id: number;
  title: string;
};

export type RegionSummary = {
  regionId: string;
  slug: string;
  name: string;
  posts: RegionHeadline[];
};

export type LandingSummary = {
  usaPosts: FeedItem[];
  regionPosts: RegionSummary[];
};
