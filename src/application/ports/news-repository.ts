import { NewsItem, NewsStatus } from '@/src/domain/entities/news-item';

export type UpsertNewsInput = {
  title: string;
  summary: string | null;
  url: string;
  source: string;
  publishedAt: string;
  tags: string[];
  status: NewsStatus;
};

export type NewsFilters = {
  status?: NewsStatus;
  tag?: string;
  limit?: number;
  cursor?: string;
};

export type NewsPage = {
  items: NewsItem[];
  nextCursor: string | null;
};

export interface NewsRepository {
  upsertNewsItem(input: UpsertNewsInput): Promise<NewsItem>;
  getNewsItems(filters: NewsFilters): Promise<NewsPage>;
  getNewsItemsByRegion(region: string, filters: NewsFilters): Promise<NewsPage>;
  updateStatus(id: number, status: NewsStatus): Promise<void>;
}
