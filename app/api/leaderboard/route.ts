import { pool } from '@/src/lib/db';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const period = searchParams.get('period') || 'all'; // all, month, week

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND u.created_at >= NOW() - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "AND u.created_at >= NOW() - INTERVAL '30 days'";
    }

    const { rows } = await pool.query(`
      SELECT
        u.id,
        u.display_name,
        u.reputation,
        COALESCE(pc.post_count, 0)::int AS post_count,
        COALESCE(cc.comment_count, 0)::int AS comment_count
      FROM users u
      LEFT JOIN (
        SELECT author_id, COUNT(*)::int AS post_count
        FROM posts WHERE is_hidden = FALSE
        GROUP BY author_id
      ) pc ON pc.author_id = u.id
      LEFT JOIN (
        SELECT author_id, COUNT(*)::int AS comment_count
        FROM comments WHERE is_hidden = FALSE
        GROUP BY author_id
      ) cc ON cc.author_id = u.id
      WHERE u.is_active = TRUE ${dateFilter}
      ORDER BY u.reputation DESC
      LIMIT 50
    `);

    const items = (rows as Record<string, unknown>[]).map((r) => ({
      id: Number(r.id),
      displayName: String(r.display_name),
      reputation: Number(r.reputation),
      postCount: Number(r.post_count),
      commentCount: Number(r.comment_count),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return badRequest(message);
  }
}
