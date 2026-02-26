import { pool } from '@/src/lib/db';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cursor = request.nextUrl.searchParams.get('cursor') ? Number(request.nextUrl.searchParams.get('cursor')) : undefined;
    const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 20, 50);

    const conditions = ['p.is_hidden = FALSE', "p.created_at >= NOW() - INTERVAL '7 days'"];
    const values: unknown[] = [];
    let idx = 1;

    if (cursor) {
      conditions.push(`p.id < $${idx++}`);
      values.push(cursor);
    }

    values.push(limit + 1);

    // Trending score = recent votes (24h) * 2 + recent comments (24h) + total score
    const sql = `
      SELECT
        p.id, p.title, p.body, p.type,
        p.author_id, u.display_name AS author_display_name,
        p.region_id, p.created_at,
        COALESCE(vs.score, 0)::int AS score,
        COALESCE(cc.cnt, 0)::int AS comment_count,
        COALESCE(rv.recent_votes, 0)::int AS recent_votes,
        COALESCE(rc.recent_comments, 0)::int AS recent_comments,
        (COALESCE(rv.recent_votes, 0) * 2 + COALESCE(rc.recent_comments, 0) + COALESCE(vs.score, 0))::int AS trending_score
      FROM posts p
      JOIN users u ON u.id = p.author_id
      LEFT JOIN (SELECT target_id, COUNT(*)::int AS score FROM votes WHERE target_type = 'POST' GROUP BY target_id) vs ON vs.target_id = p.id
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS cnt FROM comments GROUP BY post_id) cc ON cc.post_id = p.id
      LEFT JOIN (SELECT target_id, COUNT(*)::int AS recent_votes FROM votes WHERE target_type = 'POST' AND created_at >= NOW() - INTERVAL '24 hours' GROUP BY target_id) rv ON rv.target_id = p.id
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS recent_comments FROM comments WHERE created_at >= NOW() - INTERVAL '24 hours' GROUP BY post_id) rc ON rc.post_id = p.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY trending_score DESC, p.created_at DESC, p.id DESC
      LIMIT $${idx}
    `;

    const { rows } = await pool.query(sql, values);
    const hasMore = rows.length > limit;
    const resultRows = hasMore ? rows.slice(0, limit) : rows;

    const items = resultRows.map((r: Record<string, unknown>) => ({
      id: Number(r.id),
      title: String(r.title),
      bodySnippet: String(r.body).slice(0, 150),
      type: String(r.type),
      authorId: Number(r.author_id),
      authorDisplayName: String(r.author_display_name),
      regionId: r.region_id ? String(r.region_id) : null,
      score: Number(r.score),
      commentCount: Number(r.comment_count),
      trendingScore: Number(r.trending_score),
      createdAt: String(r.created_at),
    }));

    const last = items[items.length - 1];
    return NextResponse.json({
      items,
      nextCursor: hasMore && last ? last.id : null,
    });
  } catch {
    return badRequest('Failed to fetch trending posts');
  }
}
