import { pool } from '@/src/lib/db';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const userId = Number(id);
    if (isNaN(userId)) return badRequest('Invalid user ID');

    // Count posts + comments per day for last 84 days
    const sql = `
      SELECT d::date AS day, COALESCE(activity, 0)::int AS count
      FROM generate_series(
        CURRENT_DATE - INTERVAL '83 days',
        CURRENT_DATE,
        '1 day'
      ) AS d
      LEFT JOIN (
        SELECT created_at::date AS day, COUNT(*)::int AS activity
        FROM (
          SELECT created_at FROM posts WHERE author_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '83 days'
          UNION ALL
          SELECT created_at FROM comments WHERE author_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '83 days'
        ) combined
        GROUP BY created_at::date
      ) a ON a.day = d::date
      ORDER BY day
    `;

    const { rows } = await pool.query<Record<string, unknown>>(sql, [userId]);

    const activity: Record<string, number> = {};
    for (const r of rows) {
      const day = new Date(String(r.day)).toISOString().split('T')[0];
      activity[day] = Number(r.count);
    }

    return NextResponse.json({ activity });
  } catch {
    return badRequest('Failed to fetch activity');
  }
}
