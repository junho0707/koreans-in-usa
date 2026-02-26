import { pool } from '@/src/lib/db';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/src/interfaces/http/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = Number(id);

    let userId: number | null = null;
    try {
      userId = await requireUserId();
    } catch {
      // Anonymous view
    }

    // Create a simple hash from IP for dedup (anonymous users)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';
    const ipHash = Buffer.from(ip).toString('base64').slice(0, 20);

    // Deduplicate: don't count if same user/ip viewed in last hour
    const dedup = userId
      ? await pool.query(
          `SELECT id FROM post_views WHERE post_id = $1 AND user_id = $2 AND viewed_at > NOW() - INTERVAL '1 hour'`,
          [postId, userId]
        )
      : await pool.query(
          `SELECT id FROM post_views WHERE post_id = $1 AND ip_hash = $2 AND viewed_at > NOW() - INTERVAL '1 hour'`,
          [postId, ipHash]
        );

    if (dedup.rows.length === 0) {
      await pool.query(
        'INSERT INTO post_views (post_id, user_id, ip_hash) VALUES ($1, $2, $3)',
        [postId, userId, userId ? null : ipHash]
      );
      // Update cached count
      await pool.query(
        'UPDATE posts SET view_count = view_count + 1 WHERE id = $1',
        [postId]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return badRequest(message);
  }
}
