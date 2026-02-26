import { pool } from '@/src/lib/db';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const pid = Number(postId);

    // Get poll
    const pollRes = await pool.query(
      'SELECT id, question, ends_at FROM polls WHERE post_id = $1',
      [pid]
    );
    if (pollRes.rows.length === 0) {
      return NextResponse.json({ poll: null });
    }
    const poll = pollRes.rows[0] as { id: number; question: string; ends_at: string | null };

    // Get options with vote counts
    const optionsRes = await pool.query(
      `SELECT po.id, po.label, po.sort_order, COUNT(pv.id)::int AS vote_count
       FROM poll_options po
       LEFT JOIN poll_votes pv ON pv.option_id = po.id
       WHERE po.poll_id = $1
       GROUP BY po.id, po.label, po.sort_order
       ORDER BY po.sort_order`,
      [poll.id]
    );

    // Check if current user voted
    let userVoteOptionId: number | null = null;
    try {
      const userId = await requireUserId();
      const voteRes = await pool.query(
        'SELECT option_id FROM poll_votes WHERE poll_id = $1 AND user_id = $2',
        [poll.id, userId]
      );
      if (voteRes.rows.length > 0) {
        userVoteOptionId = (voteRes.rows[0] as { option_id: number }).option_id;
      }
    } catch {
      // Not authenticated, that's fine
    }

    const totalVotes = (optionsRes.rows as { vote_count: number }[]).reduce(
      (sum, r) => sum + r.vote_count, 0
    );

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        endsAt: poll.ends_at,
        totalVotes,
        userVoteOptionId,
        options: (optionsRes.rows as { id: number; label: string; vote_count: number }[]).map((o) => ({
          id: o.id,
          label: o.label,
          voteCount: o.vote_count,
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return badRequest(message);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const userId = await requireUserId();
    const { postId } = await params;
    const pid = Number(postId);
    const { optionId } = await request.json();

    if (!optionId) return badRequest('optionId required');

    // Get poll
    const pollRes = await pool.query(
      'SELECT id, ends_at FROM polls WHERE post_id = $1',
      [pid]
    );
    if (pollRes.rows.length === 0) return badRequest('No poll found');

    const poll = pollRes.rows[0] as { id: number; ends_at: string | null };

    // Check if poll is expired
    if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
      return badRequest('Poll has ended');
    }

    // Upsert vote
    await pool.query(
      `INSERT INTO poll_votes (poll_id, option_id, user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (poll_id, user_id) DO UPDATE SET option_id = $2`,
      [poll.id, optionId, userId]
    );

    return NextResponse.json({ voted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
