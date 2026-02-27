import { FeedRepository } from '@/src/application/ports/feed-repository';
import {
  LandingSummary,
  RegionSummary,
} from '@/src/application/dto/landing-summary';
import { FeedItem } from '@/src/domain/entities/feed-item';
import { FeedFilters, FeedPage, normalizeLimit } from '@/src/domain/feed';
import {
  decodeFeedCursor,
  encodeFeedCursor,
  isAfterCursor,
} from '@/src/domain/value-objects/feed-cursor';
import { pool } from '@/src/lib/db';

type QueryParts = { where: string[]; values: unknown[] };

type FeedRow = {
  id: string | number;
  title: string;
  body: string;
  type: 'QA' | 'TIP' | 'GENERAL';
  author_id: string | number;
  author_display_name: string | null;
  created_at: string;
  region_id: 'NE' | 'S' | 'MW' | 'W' | null;
  state_code: string | null;
  metro_area: string | null;
  scope_usa: boolean;
  scope_region: boolean;
  score: string | number;
  comment_count: string | number;
};

function buildCommonFilters(filters: FeedFilters, startIndex = 1): QueryParts {
  const where: string[] = [];
  const values: unknown[] = [];
  let idx = startIndex;

  if (filters.state) {
    where.push(`p.state_code = $${idx++}`);
    values.push(filters.state);
  }

  if (filters.type) {
    where.push(`p.type = $${idx++}`);
    values.push(filters.type.toUpperCase());
  }

  if (filters.topic) {
    where.push(
      `EXISTS (SELECT 1 FROM post_topic_tags ptt JOIN topic_tags tt ON tt.id = ptt.topic_tag_id WHERE ptt.post_id = p.id AND tt.slug = $${idx++})`,
    );
    values.push(filters.topic);
  }

  return { where, values };
}

function toFeedItem(row: FeedRow): FeedItem {
  return {
    id: Number(row.id),
    title: row.title,
    body: row.body,
    type: row.type,
    authorId: Number(row.author_id),
    authorDisplayName: row.author_display_name ?? 'Anonymous',
    createdAt: row.created_at,
    regionId: row.region_id,
    stateCode: row.state_code,
    metroArea: row.metro_area,
    scopeUsa: row.scope_usa,
    scopeRegion: row.scope_region,
    score: Number(row.score),
    commentCount: Number(row.comment_count ?? 0),
  };
}

function toPage(rows: FeedRow[], sort: FeedFilters['sort']): FeedPage {
  const items = rows.map(toFeedItem);
  const last = items.at(-1);

  if (!last) {
    return { items, nextCursor: null };
  }

  const cursorScore = sort === 'new' ? 0 : last.score;
  return {
    items,
    nextCursor: encodeFeedCursor({
      score: cursorScore,
      createdAt: last.createdAt,
      id: last.id,
    }),
  };
}

export class PgFeedRepository implements FeedRepository {
  async getUsaFeed(filters: FeedFilters): Promise<FeedPage> {
    const limit = normalizeLimit(filters.limit);
    const sort = filters.sort ?? 'top12h';
    const queryValues: unknown[] = [];
    const { where, values } = buildCommonFilters(filters, 1);
    queryValues.push(...values);

    if (filters.region) {
      where.push(`p.region_id = $${queryValues.length + 1}`);
      queryValues.push(filters.region.toUpperCase());
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderBy =
      sort === 'new'
        ? 'ORDER BY p.created_at DESC, p.id DESC'
        : 'ORDER BY score DESC, p.created_at DESC, p.id DESC';

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
        SELECT rp.id FROM recent_posts rp WHERE rp.scope_usa = TRUE AND rp.is_hidden = FALSE AND rp.community_id IS NULL
        UNION
        SELECT rr.id FROM region_ranked rr JOIN recent_posts rp ON rp.id = rr.id WHERE region_rank <= 3 AND rp.is_hidden = FALSE AND rp.community_id IS NULL
      )
      SELECT p.id,
             p.title,
             p.body,
             p.type,
             p.author_id,
             u.display_name AS author_display_name,
             p.created_at,
             p.region_id,
             p.state_code,
             p.metro_area,
             p.scope_usa,
             p.scope_region,
             COALESCE(ps.score, 0)::bigint AS score,
             (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id)::bigint AS comment_count
      FROM posts p
      JOIN candidate_ids c ON c.id = p.id
      LEFT JOIN users u ON u.id = p.author_id
      LEFT JOIN post_scores ps ON ps.target_id = p.id
      ${whereSql}
      ${orderBy}
      LIMIT $${queryValues.length};
    `;

    const { rows } = await pool.query<FeedRow>(sql, queryValues);
    const mapped: FeedItem[] = (rows as FeedRow[]).map(toFeedItem);
    const cursor = filters.cursor ? decodeFeedCursor(filters.cursor) : null;
    const filtered = cursor
      ? mapped.filter((item: FeedItem) =>
          sort === 'new'
            ? item.createdAt < cursor.createdAt || (item.createdAt === cursor.createdAt && item.id < cursor.id)
            : isAfterCursor(item, cursor),
        )
      : mapped;

    return toPage(
      filtered.slice(0, limit).map((item: FeedItem) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        type: item.type,
        author_id: item.authorId,
        author_display_name: item.authorDisplayName,
        created_at: item.createdAt,
        region_id: item.regionId,
        state_code: item.stateCode,
        metro_area: item.metroArea,
        scope_usa: item.scopeUsa,
        scope_region: item.scopeRegion,
        score: item.score,
        comment_count: item.commentCount,
      })),
      sort,
    );
  }

  async getRegionFeed(regionSlug: string, filters: FeedFilters): Promise<FeedPage> {
    const limit = normalizeLimit(filters.limit);
    const sort = filters.sort ?? 'top12h';
    const queryValues: unknown[] = [regionSlug];

    const { where, values } = buildCommonFilters(filters, 2);
    queryValues.push(...values);

    const whereSql = [`p.scope_region = TRUE`, `r.slug = $1`, `p.is_hidden = FALSE`, `p.community_id IS NULL`, ...where].join(' AND ');
    const recentOnly = sort === 'top12h' ? `AND p.created_at >= NOW() - INTERVAL '12 hours'` : '';
    const orderBy =
      sort === 'new'
        ? 'ORDER BY p.created_at DESC, p.id DESC'
        : 'ORDER BY COALESCE(ps.score, 0) DESC, p.created_at DESC, p.id DESC';

    queryValues.push(limit + 1);

    const sql = `
      WITH post_scores AS (
        SELECT target_id, COUNT(*)::bigint AS score
        FROM votes
        WHERE target_type = 'POST'
        GROUP BY target_id
      )
      SELECT p.id,
             p.title,
             p.body,
             p.type,
             p.author_id,
             u.display_name AS author_display_name,
             p.created_at,
             p.region_id,
             p.state_code,
             p.metro_area,
             p.scope_usa,
             p.scope_region,
             COALESCE(ps.score, 0)::bigint AS score,
             (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id)::bigint AS comment_count
      FROM posts p
      JOIN regions r ON r.id = p.region_id
      LEFT JOIN users u ON u.id = p.author_id
      LEFT JOIN post_scores ps ON ps.target_id = p.id
      WHERE ${whereSql}
      ${recentOnly}
      ${orderBy}
      LIMIT $${queryValues.length};
    `;

    const { rows } = await pool.query<FeedRow>(sql, queryValues);
    const mapped: FeedItem[] = (rows as FeedRow[]).map(toFeedItem);
    const cursor = filters.cursor ? decodeFeedCursor(filters.cursor) : null;
    const filtered = cursor
      ? mapped.filter((item: FeedItem) =>
          sort === 'new'
            ? item.createdAt < cursor.createdAt || (item.createdAt === cursor.createdAt && item.id < cursor.id)
            : isAfterCursor(item, cursor),
        )
      : mapped;

    return toPage(
      filtered.slice(0, limit).map((item: FeedItem) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        type: item.type,
        author_id: item.authorId,
        author_display_name: item.authorDisplayName,
        created_at: item.createdAt,
        region_id: item.regionId,
        state_code: item.stateCode,
        metro_area: item.metroArea,
        scope_usa: item.scopeUsa,
        scope_region: item.scopeRegion,
        score: item.score,
        comment_count: item.commentCount,
      })),
      sort,
    );
  }

  async getLandingSummary(): Promise<LandingSummary> {
    const usaPostsSql = `
      WITH post_scores AS (
        SELECT target_id, COUNT(*)::int AS score
        FROM votes WHERE target_type = 'POST' GROUP BY target_id
      )
      SELECT p.id, p.title, p.body, p.type,
             p.author_id, u.display_name AS author_display_name,
             p.created_at, p.region_id, p.state_code, p.metro_area,
             p.scope_usa, p.scope_region,
             COALESCE(ps.score, 0)::int AS score,
             (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id)::int AS comment_count
      FROM posts p
      LEFT JOIN users u ON u.id = p.author_id
      LEFT JOIN post_scores ps ON ps.target_id = p.id
      WHERE p.is_hidden = FALSE
        AND p.type IN ('QA', 'TIP')
        AND p.community_id IS NULL
        AND p.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY COALESCE(ps.score, 0) DESC, p.created_at DESC
      LIMIT 5
    `;

    const regionPostsSql = `
      SELECT r.id AS region_id, r.slug, r.name, p.id AS post_id, p.title,
             ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY p.created_at DESC) AS rn
      FROM posts p
      JOIN regions r ON r.id = p.region_id
      WHERE p.is_hidden = FALSE
        AND p.scope_region = TRUE
        AND p.community_id IS NULL
        AND p.created_at >= NOW() - INTERVAL '7 days'
    `;

    const [usaResult, regionResult] = await Promise.all([
      pool.query(usaPostsSql),
      pool.query(regionPostsSql),
    ]);

    const usaPosts: FeedItem[] = (usaResult.rows as FeedRow[]).map((r) => toFeedItem(r));

    const regionMap = new Map<string, RegionSummary>();
    for (const r of regionResult.rows as Record<string, unknown>[]) {
      if (Number(r.rn) > 3) continue;
      const key = String(r.region_id);
      if (!regionMap.has(key)) {
        regionMap.set(key, {
          regionId: key,
          slug: String(r.slug),
          name: String(r.name),
          posts: [],
        });
      }
      regionMap.get(key)!.posts.push({
        id: Number(r.post_id),
        title: String(r.title),
      });
    }
    const regionPosts: RegionSummary[] = Array.from(regionMap.values());

    return { usaPosts, regionPosts };
  }
}
