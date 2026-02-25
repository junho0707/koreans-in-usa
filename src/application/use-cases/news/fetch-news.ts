import { NewsRepository } from '@/src/application/ports/news-repository';
import { fetchAllSources } from '@/src/infrastructure/news/rss-fetcher';
import { tagNewsItem } from '@/src/infrastructure/news/news-tagger';
import { RSS_SOURCES, RssSource } from '@/src/infrastructure/news/sources';

export async function fetchAndStoreNews(
  repo: NewsRepository,
  sources: RssSource[] = RSS_SOURCES,
): Promise<{ fetched: number; stored: number }> {
  const rawItems = await fetchAllSources(sources);

  let stored = 0;
  for (const item of rawItems) {
    const source = sources.find((s) => s.name === item.source);
    const tags = tagNewsItem(item.title, item.summary, source?.tags);

    await repo.upsertNewsItem({
      title: item.title,
      summary: item.summary,
      url: item.url,
      source: item.source,
      publishedAt: item.publishedAt,
      tags,
      status: 'PUBLISHED',
    });
    stored++;
  }

  return { fetched: rawItems.length, stored };
}
