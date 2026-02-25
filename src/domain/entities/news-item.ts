export type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type NewsItem = {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  source: string;
  publishedAt: string;
  tags: string[];
  status: NewsStatus;
  createdAt: string;
};
