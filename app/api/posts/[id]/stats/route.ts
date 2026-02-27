import { pool } from '@/src/lib/db';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized, forbidden } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const postId = Number(id);

    // Verify ownership
    const { rows: postRows } = await pool.query<Record<string, unknown>>(
      'SELECT author_id FROM posts WHERE id = $1',
      [postId],
    );
    if (postRows.length === 0) return badRequest('Post not found');
    if (Number(postRows[0].author_id) !== userId) {
      return forbidden('You can only view stats for your own posts');
    }

    // Get stats
    const sql = `
      SELECT
        p.created_at,
        COALESCE(vs.vote_count, 0)::int AS vote_count,
        COALESCE(cc.comment_count, 0)::int AS comment_count,
        COALESCE(bk.bookmark_count, 0)::int AS bookmark_count,
        COALESCE(vs24.recent_votes, 0)::int AS votes_24h,
        COALESCE(cc24.recent_comments, 0)::int AS comments_24h
      FROM posts p
      LEFT JOIN (SELECT target_id, COUNT(*)::int AS vote_count FROM votes WHERE target_type = 'POST' AND target_id = $1 GROUP BY target_id) vs ON TRUE
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS comment_count FROM comments WHERE post_id = $1 GROUP BY post_id) cc ON TRUE
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS bookmark_count FROM bookmarks WHERE post_id = $1 GROUP BY post_id) bk ON TRUE
      LEFT JOIN (SELECT target_id, COUNT(*)::int AS recent_votes FROM votes WHERE target_type = 'POST' AND target_id = $1 AND created_at >= NOW() - INTERVAL '24 hours' GROUP BY target_id) vs24 ON TRUE
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS recent_comments FROM comments WHERE post_id = $1 AND created_at >= NOW() - INTERVAL '24 hours' GROUP BY post_id) cc24 ON TRUE
      WHERE p.id = $1
    `;

    const { rows } = await pool.query<Record<string, unknown>>(sql, [postId]);
    if (rows.length === 0) return badRequest('Stats not available');

    const r = rows[0];
    return NextResponse.json({
      createdAt: String(r.created_at),
      voteCount: Number(r.vote_count),
      commentCount: Number(r.comment_count),
      bookmarkCount: Number(r.bookmark_count),
      votes24h: Number(r.votes_24h),
      comments24h: Number(r.comments_24h),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed';
    if (msg === 'Not authenticated') return unauthorized(msg);
    return badRequest(msg);
  }
}
