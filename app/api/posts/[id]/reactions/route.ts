import { pool } from '@/src/lib/db';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = Number(id);

    const { rows } = await pool.query(
      `SELECT emoji, COUNT(*)::int AS count,
        ARRAY_AGG(user_id) AS user_ids
       FROM reactions WHERE post_id = $1
       GROUP BY emoji
       ORDER BY count DESC`,
      [postId]
    );

    let viewerReactions: string[] = [];
    try {
      const userId = await requireUserId();
      const userRes = await pool.query(
        'SELECT emoji FROM reactions WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );
      viewerReactions = (userRes.rows as { emoji: string }[]).map((r) => r.emoji);
    } catch {
      // Not authenticated
    }

    const reactions = (rows as { emoji: string; count: number }[]).map((r) => ({
      emoji: r.emoji,
      count: r.count,
    }));

    return NextResponse.json({ reactions, viewerReactions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return badRequest(message);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const postId = Number(id);
    const { emoji } = await request.json();

    if (!ALLOWED_EMOJIS.includes(emoji)) return badRequest('Invalid emoji');

    // Toggle: insert or delete
    const existing = await pool.query(
      'SELECT id FROM reactions WHERE post_id = $1 AND user_id = $2 AND emoji = $3',
      [postId, userId, emoji]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM reactions WHERE post_id = $1 AND user_id = $2 AND emoji = $3',
        [postId, userId, emoji]
      );
      return NextResponse.json({ toggled: false });
    }

    await pool.query(
      'INSERT INTO reactions (post_id, user_id, emoji) VALUES ($1, $2, $3)',
      [postId, userId, emoji]
    );
    return NextResponse.json({ toggled: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
