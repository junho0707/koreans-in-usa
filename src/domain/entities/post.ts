export type RegionId = 'NE' | 'S' | 'MW' | 'W';
export type PostType = 'QA' | 'TIP' | 'GENERAL';

export type Post = {
  id: number;
  authorId: number;
  type: PostType;
  title: string;
  body: string;
  scopeUsa: boolean;
  scopeRegion: boolean;
  regionId: RegionId | null;
  stateCode: string | null;
  metroArea: string | null;
  createdAt: string;
};

export function normalizePostType(input: string): PostType {
  const upper = input.toUpperCase();
  if (upper !== 'QA' && upper !== 'TIP' && upper !== 'GENERAL') {
    throw new Error('Invalid post type');
  }
  return upper;
}
