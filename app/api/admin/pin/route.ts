import { pool } from '@/src/lib/db';
import { requireUserId } from '@/src/interfaces/http/auth';
import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { unauthorized, badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const userRepo = new PgUserRepository();

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const user = await userRepo.findById(userId);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const body = await request.json();
    const postId = Number(body.postId);
    const pin = Boolean(body.pin);

    if (!postId) return badRequest('postId is required');

    await pool.query<Record<string, unknown>>('UPDATE posts SET is_pinned = $1 WHERE id = $2', [pin, postId]);
    return NextResponse.json({ ok: true, pinned: pin });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
