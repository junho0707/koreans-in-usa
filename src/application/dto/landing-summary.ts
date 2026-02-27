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

export type NewsItemSummary = {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  source: string;
  publishedAt: string;
  tags: string[];
};

export type LandingSummary = {
  usaPosts: FeedItem[];
  regionPosts: RegionSummary[];
  news: NewsItemSummary[];
};
