import { NewsRepository, UpsertNewsInput, NewsFilters, NewsPage } from '@/src/application/ports/news-repository';
import { NewsItem, NewsStatus } from '@/src/domain/entities/news-item';
import { pool } from '@/src/lib/db';

type NewsRow = {
  id: string | number;
  title: string;
  summary: string | null;
  url: string;
  source: string;
  published_at: string;
  tags: string[];
  status: string;
  created_at: string;
};

function toNewsItem(row: NewsRow): NewsItem {
  return {
    id: Number(row.id),
    title: row.title,
    summary: row.summary,
    url: row.url,
    source: row.source,
    publishedAt: row.published_at,
    tags: row.tags ?? [],
    status: row.status as NewsStatus,
    createdAt: row.created_at,
  };
}

export class PgNewsRepository implements NewsRepository {
  async upsertNewsItem(input: UpsertNewsInput): Promise<NewsItem> {
    const { rows } = await pool.query<NewsRow>(
      `INSERT INTO news_items (title, summary, url, source, published_at, tags, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (url) DO UPDATE SET
         title = EXCLUDED.title,
         summary = EXCLUDED.summary,
         tags = EXCLUDED.tags,
         status = EXCLUDED.status
       RETURNING id, title, summary, url, source, published_at, tags, status, created_at`,
      [input.title, input.summary, input.url, input.source, input.publishedAt, input.tags, input.status],
    );
    return toNewsItem(rows[0]);
  }

  async getNewsItems(filters: NewsFilters): Promise<NewsPage> {
    const limit = Math.min(filters.limit ?? 20, 50);
    const where: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (filters.status) {
      where.push(`status = $${idx++}`);
      values.push(filters.status);
    } else {
      where.push(`status = $${idx++}`);
      values.push('PUBLISHED');
    }

    if (filters.tag) {
      where.push(`$${idx++} = ANY(tags)`);
      values.push(filters.tag);
    }

    if (filters.cursor) {
      where.push(`published_at < $${idx++}`);
      values.push(filters.cursor);
    }

    values.push(limit + 1);

    const sql = `
      SELECT id, title, summary, url, source, published_at, tags, status, created_at
      FROM news_items
      WHERE ${where.join(' AND ')}
      ORDER BY published_at DESC
      LIMIT $${idx}
    `;

    const { rows } = await pool.query<NewsRow>(sql, values);
    const items = rows.slice(0, limit).map(toNewsItem);
    const hasMore = rows.length > limit;

    return {
      items,
      nextCursor: hasMore && items.length > 0 ? items[items.length - 1].publishedAt : null,
    };
  }

  async getNewsItemsByRegion(region: string, filters: NewsFilters): Promise<NewsPage> {
    // News items tagged with the region slug
    const regionTag = region.toLowerCase();
    return this.getNewsItems({ ...filters, tag: regionTag });
  }

  async updateStatus(id: number, status: NewsStatus): Promise<void> {
    await pool.query('UPDATE news_items SET status = $1 WHERE id = $2', [status, id]);
  }
}
