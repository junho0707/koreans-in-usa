import { pool } from '@/src/lib/db';
import { badRequest, notFound } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    const { rows } = await pool.query(
      `SELECT
        u.id, u.display_name, u.reputation,
        CASE
          WHEN u.reputation >= 1000 THEN 'legend'
          WHEN u.reputation >= 500 THEN 'expert'
          WHEN u.reputation >= 100 THEN 'active'
          WHEN u.reputation >= 20 THEN 'contributor'
          ELSE 'newcomer'
        END AS badge,
        COALESCE(pc.cnt, 0)::int AS post_count,
        COALESCE(cc.cnt, 0)::int AS comment_count
      FROM users u
      LEFT JOIN (SELECT author_id, COUNT(*)::int AS cnt FROM posts WHERE is_hidden = FALSE GROUP BY author_id) pc ON pc.author_id = u.id
      LEFT JOIN (SELECT author_id, COUNT(*)::int AS cnt FROM comments WHERE is_hidden = FALSE GROUP BY author_id) cc ON cc.author_id = u.id
      WHERE u.id = $1 AND u.is_active = TRUE`,
      [userId]
    );

    if (rows.length === 0) return notFound('User not found');

    const r = rows[0] as Record<string, unknown>;
    return NextResponse.json({
      id: Number(r.id),
      displayName: String(r.display_name),
      reputation: Number(r.reputation),
      badge: String(r.badge),
      postCount: Number(r.post_count),
      commentCount: Number(r.comment_count),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return badRequest(message);
  }
}
