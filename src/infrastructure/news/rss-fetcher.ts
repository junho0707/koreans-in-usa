import RssParser from 'rss-parser';
import { RssSource } from '@/src/infrastructure/news/sources';

export type RawNewsItem = {
  title: string;
  summary: string | null;
  url: string;
  source: string;
  publishedAt: string;
};

const parser = new RssParser();

export async function fetchRssSource(source: RssSource): Promise<RawNewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items ?? [])
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!,
        summary: item.contentSnippet?.slice(0, 500) ?? null,
        url: item.link!,
        source: source.name,
        publishedAt: item.isoDate ?? new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export async function fetchAllSources(sources: RssSource[]): Promise<RawNewsItem[]> {
  const results = await Promise.allSettled(
    sources.map((s) => fetchRssSource(s)),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<RawNewsItem[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);
}
