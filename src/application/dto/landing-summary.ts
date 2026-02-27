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

export type CommunityPreview = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  memberCount: number;
  scope: string;
  privacy: string;
};

export type LandingSummary = {
  usaQA: FeedItem[];
  usaTips: FeedItem[];
  regionPosts: RegionSummary[];
  publicCommunities: CommunityPreview[];
};
