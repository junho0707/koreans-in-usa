export type SearchFilters = {
  query: string;
  type?: 'QA' | 'TIP' | 'GENERAL';
  region?: string;
  tag?: string;
  cursor?: number;
  limit?: number;
};

export type SearchResultItem = {
  id: number;
  title: string;
  bodySnippet: string;
  type: string;
  authorId: number;
  authorDisplayName: string;
  regionId: string | null;
  score: number;
  commentCount: number;
  tags: string[];
  createdAt: string;
};

export type SearchResult = {
  items: SearchResultItem[];
  nextCursor: number | null;
  total: number;
};

export interface SearchRepository {
  search(filters: SearchFilters): Promise<SearchResult>;
}
