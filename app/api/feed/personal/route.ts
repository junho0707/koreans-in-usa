import { pool } from '@/src/lib/db';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { searchParams } = request.nextUrl;
    const cursor = searchParams.get('cursor') ? Number(searchParams.get('cursor')) : undefined;
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    // Get user's interests to match against topic tags
    const userResult = await pool.query<{ interests: string[] }>(
      'SELECT interests FROM users WHERE id = $1',
      [userId],
    );
    const interests: string[] = userResult.rows[0]?.interests ?? [];

    const conditions: string[] = ['p.is_hidden = FALSE'];
    const values: unknown[] = [userId];
    let idx = 2;

    // Build the UNION sources
    // Source 1: posts from followed users
    // Source 2: posts matching user's interest tags
    let sourceSql: string;

    if (interests.length > 0) {
      // Find topic tag IDs matching user interests (case-insensitive)
      values.push(interests.map((i) => i.toLowerCase()));
      sourceSql = `
        SELECT DISTINCT p.id FROM posts p
        WHERE p.is_hidden = FALSE AND (
          p.author_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
          OR p.id IN (
            SELECT ptt.post_id FROM post_topic_tags ptt
            JOIN topic_tags tt ON tt.id = ptt.topic_tag_id
            WHERE LOWER(tt.name) = ANY($${idx++})
          )
        )
      `;
    } else {
      sourceSql = `
        SELECT DISTINCT p.id FROM posts p
        WHERE p.is_hidden = FALSE
          AND p.author_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
      `;
    }

    if (cursor) {
      conditions.push(`p.id < $${idx++}`);
      values.push(cursor);
    }

    values.push(limit + 1);

    const cursorCondition = cursor ? `AND sub.id < $${idx - 2}` : '';

    const sql = `
      WITH candidate_ids AS (
        ${sourceSql}
      )
      SELECT
        p.id, p.title, p.body, p.type,
        p.author_id, u.display_name AS author_display_name,
        p.region_id, p.state_code, p.metro_area,
        p.scope_usa, p.scope_region, p.created_at,
        COALESCE(vs.score, 0)::int AS score,
        COALESCE(cc.cnt, 0)::int AS comment_count
      FROM posts p
      JOIN candidate_ids c ON c.id = p.id
      JOIN users u ON u.id = p.author_id
      LEFT JOIN (SELECT target_id, COUNT(*)::int AS score FROM votes WHERE target_type = 'POST' GROUP BY target_id) vs ON vs.target_id = p.id
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS cnt FROM comments GROUP BY post_id) cc ON cc.post_id = p.id
      ${cursor ? `WHERE p.id < $${idx - 2}` : ''}
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT $${idx}
    `;

    const { rows } = await pool.query<Record<string, unknown>>(sql, values);
    const hasMore = rows.length > limit;
    const resultRows = hasMore ? rows.slice(0, limit) : rows;

    const items = resultRows.map((r) => ({
      id: Number(r.id),
      title: String(r.title),
      body: String(r.body),
      type: String(r.type),
      authorId: Number(r.author_id),
      authorDisplayName: String(r.author_display_name),
      regionId: r.region_id ? String(r.region_id) : null,
      stateCode: r.state_code ? String(r.state_code) : null,
      metroArea: r.metro_area ? String(r.metro_area) : null,
      scopeUsa: Boolean(r.scope_usa),
      scopeRegion: Boolean(r.scope_region),
      score: Number(r.score),
      commentCount: Number(r.comment_count),
      createdAt: String(r.created_at),
    }));

    const last = items[items.length - 1];
    return NextResponse.json({
      items,
      nextCursor: hasMore && last ? last.id : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
