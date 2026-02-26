import { pool } from '@/src/lib/db';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const userId = await requireUserId();

    // Suggest active users that the current user doesn't follow
    const { rows } = await pool.query(
      `SELECT u.id, u.display_name, u.reputation,
        COALESCE(pc.cnt, 0)::int AS post_count
       FROM users u
       LEFT JOIN (SELECT author_id, COUNT(*)::int AS cnt FROM posts WHERE is_hidden = FALSE GROUP BY author_id) pc ON pc.author_id = u.id
       WHERE u.is_active = TRUE
         AND u.id != $1
         AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = $1)
       ORDER BY u.reputation DESC
       LIMIT 5`,
      [userId]
    );

    const items = (rows as Record<string, unknown>[]).map((r) => ({
      id: Number(r.id),
      displayName: String(r.display_name),
      reputation: Number(r.reputation),
      postCount: Number(r.post_count),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
