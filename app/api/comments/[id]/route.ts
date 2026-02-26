import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized, notFound } from '@/src/interfaces/http/response';
import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/src/lib/db';

const userRepo = new PgUserRepository();

type RouteContext = { params: Promise<{ id: string }> };

// Edit comment
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const commentId = Number(id);

    const { rows } = await pool.query('SELECT author_id FROM comments WHERE id = $1', [commentId]);
    if (!rows[0]) return notFound('Comment not found');
    if (Number(rows[0].author_id) !== userId) return unauthorized('Not your comment');

    const body = await request.json();
    if (!body.body?.trim()) return badRequest('Comment body is required');

    await pool.query('UPDATE comments SET body = $1 WHERE id = $2', [body.body.trim(), commentId]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}

// Delete comment
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const commentId = Number(id);

    const { rows } = await pool.query('SELECT author_id FROM comments WHERE id = $1', [commentId]);
    if (!rows[0]) return notFound('Comment not found');

    const user = await userRepo.findById(userId);
    if (Number(rows[0].author_id) !== userId && user?.role !== 'ADMIN') {
      return unauthorized('Not your comment');
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
