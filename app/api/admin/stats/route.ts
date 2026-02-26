import { pool } from '@/src/lib/db';
import { requireUserId } from '@/src/interfaces/http/auth';
import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { unauthorized, badRequest } from '@/src/interfaces/http/response';
import { NextResponse } from 'next/server';

const userRepo = new PgUserRepository();

export async function GET() {
  try {
    const userId = await requireUserId();
    const user = await userRepo.findById(userId);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE is_active = TRUE) AS total_users,
        (SELECT COUNT(*)::int FROM posts WHERE is_hidden = FALSE) AS total_posts,
        (SELECT COUNT(*)::int FROM comments WHERE is_hidden = FALSE) AS total_comments,
        (SELECT COUNT(*)::int FROM votes) AS total_votes,
        (SELECT COUNT(*)::int FROM reports) AS total_reports,
        (SELECT COUNT(*)::int FROM posts WHERE is_hidden = TRUE) AS hidden_posts,
        (SELECT COUNT(*)::int FROM users WHERE created_at >= NOW() - INTERVAL '7 days') AS new_users_7d,
        (SELECT COUNT(*)::int FROM posts WHERE created_at >= NOW() - INTERVAL '7 days' AND is_hidden = FALSE) AS new_posts_7d,
        (SELECT COUNT(*)::int FROM comments WHERE created_at >= NOW() - INTERVAL '7 days') AS new_comments_7d
    `);

    return NextResponse.json(rows[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
