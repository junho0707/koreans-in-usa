import { FeedRepository } from '@/src/application/ports/feed-repository';
import { FeedItem } from '@/src/domain/entities/feed-item';
import { FeedFilters, FeedPage, normalizeLimit } from '@/src/domain/feed';
import { decodeFeedCursor, encodeFeedCursor } from '@/src/domain/value-objects/feed-cursor';
import { pool } from '@/src/lib/db';

type QueryParts = { where: string[]; values: unknown[]; nextIndex: number };

type FeedRow = {
  id: string | number;
  title: string;
  body: string;
  type: 'QA' | 'TIP' | 'GENERAL';
  author_id: string | number;
  created_at: string;
  region_id: 'NE' | 'S' | 'MW' | 'W' | null;
  state_code: string | null;
  metro_area: string | null;
  scope_usa: boolean;
  scope_region: boolean;
  score: string | number;
};

function buildCommonFilters(filters: FeedFilters, startIndex = 1): QueryParts {
  const where: string[] = [];
  const values: unknown[] = [];
  let idx = startIndex;

  if (filters.state) {
    where.push(`state_code = $${idx++}`);
    values.push(filters.state);
  }

  if (filters.type) {
    where.push(`type = $${idx++}`);
    values.push(filters.type.toUpperCase());
  }

  if (filters.topic) {
    where.push(
      `EXISTS (
        SELECT 1
        FROM post_topic_tags ptt
        JOIN topic_tags tt ON tt.id = ptt.topic_tag_id
        WHERE ptt.post_id = id AND tt.slug = $${idx++}
      )`,
    );
    values.push(filters.topic);
  }

  return { where, values, nextIndex: idx };
}

function toFeedItem(row: FeedRow): FeedItem {
  return {
    id: Number(row.id),
    title: row.title,
    body: row.body,
    type: row.type,
    authorId: Number(row.author_id),
    createdAt: row.created_at,
    regionId: row.region_id,
    stateCode: row.state_code,
    metroArea: row.metro_area,
    scopeUsa: row.scope_usa,
    scopeRegion: row.scope_region,
    score: Number(row.score),
  };
}

function toPage(items: FeedItem[], limit: number): FeedPage {
  const pageItems = items.slice(0, limit);
  const hasMore = items.length > limit;

  if (!hasMore || pageItems.length === 0) {
    return { items: pageItems, nextCursor: null };
  }

  const last = pageItems[pageItems.length - 1];
  return {
    items: pageItems,
    nextCursor: encodeFeedCursor({
      score: last.score,
      createdAt: last.createdAt,
      id: last.id,
    }),
  };
}

function buildCursorWhere(sort: 'new' | 'top12h', nextIndex: number): string {
  if (sort === 'new') {
    return `AND (created_at, id) < ($${nextIndex}::timestamptz, $${nextIndex + 1}::bigint)`;
  }

  return `AND (score, created_at, id) < ($${nextIndex}::bigint, $${nextIndex + 1}::timestamptz, $${nextIndex + 2}::bigint)`;
}

function pushCursorParams(
  values: unknown[],
  sort: 'new' | 'top12h',
  cursor: { score: number; createdAt: string; id: number },
): void {
  if (sort === 'new') {
    values.push(cursor.createdAt, cursor.id);
    return;
  }

  values.push(cursor.score, cursor.createdAt, cursor.id);
}

export class PgFeedRepository implements FeedRepository {
  async getUsaFeed(filters: FeedFilters): Promise<FeedPage> {
    const limit = normalizeLimit(filters.limit);
    const sort = filters.sort ?? 'top12h';
    const cursor = filters.cursor ? decodeFeedCursor(filters.cursor) : null;
    const queryValues: unknown[] = [];

    const common = buildCommonFilters(filters, 1);
    queryValues.push(...common.values);

    const feedWhere = [...common.where];
    let nextIndex = common.nextIndex;

    if (filters.region) {
      feedWhere.push(`region_id = $${nextIndex++}`);
      queryValues.push(filters.region.toUpperCase());
    }

    let cursorWhere = '';
    if (cursor) {
      cursorWhere = buildCursorWhere(sort, nextIndex);
      pushCursorParams(queryValues, sort, cursor);
      nextIndex += sort === 'new' ? 2 : 3;
    }

    const orderBy =
      sort === 'new'
        ? 'ORDER BY created_at DESC, id DESC'
        : 'ORDER BY score DESC, created_at DESC, id DESC';

    queryValues.push(limit + 1);

    const sql = `
      WITH recent_posts AS (
        SELECT p.*
        FROM posts p
        WHERE p.created_at >= NOW() - INTERVAL '12 hours'
      ),
      post_scores AS (
        SELECT target_id, COUNT(*)::bigint AS score
        FROM votes
        WHERE target_type = 'POST'
        GROUP BY target_id
      ),
      region_ranked AS (
        SELECT p.id,
               ROW_NUMBER() OVER (
                 PARTITION BY p.region_id
                 ORDER BY COALESCE(ps.score, 0) DESC, p.created_at DESC, p.id DESC
               ) AS region_rank
        FROM recent_posts p
        LEFT JOIN post_scores ps ON ps.target_id = p.id
        WHERE p.scope_region = TRUE AND p.region_id IS NOT NULL
      ),
      candidate_ids AS (
        SELECT id FROM recent_posts WHERE scope_usa = TRUE
        UNION
        SELECT id FROM region_ranked WHERE region_rank <= 3
      ),
      feed AS (
        SELECT p.id,
               p.title,
               p.body,
               p.type,
               p.author_id,
               p.created_at,
               p.region_id,
               p.state_code,
               p.metro_area,
               p.scope_usa,
               p.scope_region,
               COALESCE(ps.score, 0)::bigint AS score
        FROM posts p
        JOIN candidate_ids c ON c.id = p.id
        LEFT JOIN post_scores ps ON ps.target_id = p.id
      )
      SELECT *
      FROM feed
      WHERE 1=1
      ${feedWhere.map((clause) => `AND ${clause}`).join('\n')}
      ${cursorWhere}
      ${orderBy}
      LIMIT $${nextIndex};
    `;

    const { rows } = await pool.query<FeedRow>(sql, queryValues);
    return toPage(rows.map(toFeedItem), limit);
  }

  async getRegionFeed(regionSlug: string, filters: FeedFilters): Promise<FeedPage> {
    const limit = normalizeLimit(filters.limit);
    const sort = filters.sort ?? 'top12h';
    const cursor = filters.cursor ? decodeFeedCursor(filters.cursor) : null;
    const queryValues: unknown[] = [regionSlug];

    const common = buildCommonFilters(filters, 2);
    queryValues.push(...common.values);

    const where = [...common.where, 'scope_region = TRUE', 'region_id = (SELECT id FROM regions WHERE slug = $1)'];

    if (sort === 'top12h') {
      where.push(`created_at >= NOW() - INTERVAL '12 hours'`);
    }

    let nextIndex = common.nextIndex;
    let cursorWhere = '';

    if (cursor) {
      cursorWhere = buildCursorWhere(sort, nextIndex);
      pushCursorParams(queryValues, sort, cursor);
      nextIndex += sort === 'new' ? 2 : 3;
    }

    const orderBy =
      sort === 'new'
        ? 'ORDER BY created_at DESC, id DESC'
        : 'ORDER BY score DESC, created_at DESC, id DESC';

    queryValues.push(limit + 1);

    const sql = `
      WITH post_scores AS (
        SELECT target_id, COUNT(*)::bigint AS score
        FROM votes
        WHERE target_type = 'POST'
        GROUP BY target_id
      ),
      scoped_posts AS (
        SELECT p.id,
               p.title,
               p.body,
               p.type,
               p.author_id,
               p.created_at,
               p.region_id,
               p.state_code,
               p.metro_area,
               p.scope_usa,
               p.scope_region,
               COALESCE(ps.score, 0)::bigint AS score
        FROM posts p
        LEFT JOIN post_scores ps ON ps.target_id = p.id
      )
      SELECT *
      FROM scoped_posts
      WHERE ${where.join(' AND ')}
      ${cursorWhere}
      ${orderBy}
      LIMIT $${nextIndex};
    `;

    const { rows } = await pool.query<FeedRow>(sql, queryValues);
    return toPage(rows.map(toFeedItem), limit);
  }
}
