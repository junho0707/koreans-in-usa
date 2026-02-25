import { NewsRepository, NewsFilters, NewsPage } from '@/src/application/ports/news-repository';

export async function getNewsFeed(
  repo: NewsRepository,
  filters: NewsFilters,
): Promise<NewsPage> {
  return repo.getNewsItems(filters);
}

export async function getRegionNewsFeed(
  repo: NewsRepository,
  region: string,
  filters: NewsFilters,
): Promise<NewsPage> {
  return repo.getNewsItemsByRegion(region, filters);
}
