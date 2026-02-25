import {
  SearchRepository,
  SearchFilters,
  SearchResult,
  SearchResultItem,
} from '@/src/application/ports/search-repository';
import { pool } from '@/src/lib/db';

type SearchRow = {
  id: string | number;
  title: string;
  body: string;
  type: string;
  author_id: string | number;
  author_display_name: string;
  region_id: string | null;
  score: string | number;
  comment_count: string | number;
  tags: string[] | null;
  created_at: string;
  total_count: string | number;
};

export class PgSearchRepository implements SearchRepository {
  async search(filters: SearchFilters): Promise<SearchResult> {
    const limit = Math.min(filters.limit ?? 20, 50);
    const conditions: string[] = [
      'p.is_hidden = FALSE',
      'p.search_vector @@ websearch_to_tsquery(\'english\', $1)',
    ];
    const values: unknown[] = [filters.query];
    let idx = 2;

    if (filters.type) {
      conditions.push(`p.type = $${idx++}`);
      values.push(filters.type);
    }

    if (filters.region) {
      conditions.push(`p.region_id = $${idx++}`);
      values.push(filters.region.toUpperCase());
    }

    if (filters.tag) {
      conditions.push(
        `EXISTS (SELECT 1 FROM post_topic_tags ptt JOIN topic_tags tt ON tt.id = ptt.topic_tag_id WHERE ptt.post_id = p.id AND tt.slug = $${idx++})`,
      );
      values.push(filters.tag);
    }

    if (filters.cursor) {
      conditions.push(`p.id < $${idx++}`);
      values.push(filters.cursor);
    }

    values.push(limit + 1);

    const sql = `
      SELECT
        p.id, p.title, p.body, p.type,
        p.author_id, u.display_name AS author_display_name,
        p.region_id, p.created_at,
        COALESCE(vs.score, 0)::int AS score,
        COALESCE(cc.cnt, 0)::int AS comment_count,
        COALESCE(
          ARRAY(
            SELECT tt.slug FROM post_topic_tags ptt
            JOIN topic_tags tt ON tt.id = ptt.topic_tag_id
            WHERE ptt.post_id = p.id
          ), '{}'
        ) AS tags,
        COUNT(*) OVER() AS total_count
      FROM posts p
      JOIN users u ON u.id = p.author_id
      LEFT JOIN (
        SELECT target_id, COUNT(*)::int AS score
        FROM votes WHERE target_type = 'POST'
        GROUP BY target_id
      ) vs ON vs.target_id = p.id
      LEFT JOIN (
        SELECT post_id, COUNT(*)::int AS cnt
        FROM comments
        GROUP BY post_id
      ) cc ON cc.post_id = p.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ts_rank(p.search_vector, websearch_to_tsquery('english', $1)) DESC, p.id DESC
      LIMIT $${idx}
    `;

    const { rows } = await pool.query<SearchRow>(sql, values);

    const hasMore = rows.length > limit;
    const resultRows = hasMore ? rows.slice(0, limit) : rows;
    const total = resultRows[0] ? Number(resultRows[0].total_count) : 0;

    const items: SearchResultItem[] = resultRows.map((row) => ({
      id: Number(row.id),
      title: row.title,
      bodySnippet: row.body.length > 200 ? row.body.slice(0, 200) + '...' : row.body,
      type: row.type,
      authorId: Number(row.author_id),
      authorDisplayName: row.author_display_name,
      regionId: row.region_id,
      score: Number(row.score),
      commentCount: Number(row.comment_count),
      tags: row.tags ?? [],
      createdAt: row.created_at,
    }));

    const lastItem = items[items.length - 1];
    return {
      items,
      nextCursor: hasMore && lastItem ? lastItem.id : null,
      total,
    };
  }
}
