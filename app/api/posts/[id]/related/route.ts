import { pool } from '@/src/lib/db';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const postId = Number(id);
    if (isNaN(postId)) return badRequest('Invalid post ID');

    // Find related posts by:
    // 1. Same tags
    // 2. Same type
    // 3. Same region
    // Exclude the current post, limit to 5
    const sql = `
      WITH current_post AS (
        SELECT id, type, region_id FROM posts WHERE id = $1
      ),
      current_tags AS (
        SELECT topic_tag_id FROM post_topic_tags WHERE post_id = $1
      ),
      scored AS (
        SELECT p.id, p.title, p.type, p.region_id, p.created_at,
               COALESCE(vs.score, 0)::int AS score,
               COALESCE(cc.cnt, 0)::int AS comment_count,
               (
                 CASE WHEN p.type = (SELECT type FROM current_post) THEN 2 ELSE 0 END +
                 CASE WHEN p.region_id = (SELECT region_id FROM current_post) AND p.region_id IS NOT NULL THEN 1 ELSE 0 END +
                 (SELECT COUNT(*) FROM post_topic_tags ptt WHERE ptt.post_id = p.id AND ptt.topic_tag_id IN (SELECT topic_tag_id FROM current_tags))::int * 3
               ) AS relevance
        FROM posts p
        LEFT JOIN (SELECT target_id, COUNT(*)::int AS score FROM votes WHERE target_type = 'POST' GROUP BY target_id) vs ON vs.target_id = p.id
        LEFT JOIN (SELECT post_id, COUNT(*)::int AS cnt FROM comments GROUP BY post_id) cc ON cc.post_id = p.id
        WHERE p.id != $1 AND p.is_hidden = FALSE
      )
      SELECT id, title, type, region_id, score, comment_count, created_at
      FROM scored
      WHERE relevance > 0
      ORDER BY relevance DESC, score DESC, created_at DESC
      LIMIT 5
    `;

    const { rows } = await pool.query(sql, [postId]);

    const items = rows.map((r: Record<string, unknown>) => ({
      id: Number(r.id),
      title: String(r.title),
      type: String(r.type),
      regionId: r.region_id ? String(r.region_id) : null,
      score: Number(r.score),
      commentCount: Number(r.comment_count),
      createdAt: String(r.created_at),
    }));

    return NextResponse.json({ items });
  } catch {
    return badRequest('Failed to fetch related posts');
  }
}
