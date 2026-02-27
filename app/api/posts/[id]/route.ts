import { getPostDetail } from '@/src/application/use-cases/post/get-post-detail';
import { PgPostRepository } from '@/src/infrastructure/repositories/pg-post-repository';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import { getOrCreateUser } from '@/src/application/use-cases/user/get-or-create-user';
import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { notFound, badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/src/lib/db';

const postRepo = new PgPostRepository();
const userRepo = new PgUserRepository();

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const postId = Number(id);
  if (!postId || postId <= 0) return notFound('Post not found');

  const { searchParams } = new URL(request.url);
  const commentSort = searchParams.get('commentSort') === 'new' ? 'new' : 'best';

  let viewerUserId: number | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const appUser = await getOrCreateUser(userRepo, {
        supabaseUid: user.id,
        email: user.email ?? null,
        phone: user.phone ?? null,
      });
      viewerUserId = appUser.id;
    }
  } catch {
    // Not authenticated - fine for public route
  }

  const post = await getPostDetail(postRepo, postId, viewerUserId, commentSort);
  if (!post) return notFound('Post not found');

  return NextResponse.json({ post });
}

// Edit post
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const postId = Number(id);

    // Verify ownership
    const { rows } = await pool.query<Record<string, unknown>>('SELECT author_id FROM posts WHERE id = $1', [postId]);
    if (!rows[0]) return notFound('Post not found');
    if (Number(rows[0].author_id) !== userId) return unauthorized('Not your post');

    const body = await request.json();
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (body.title !== undefined) {
      sets.push(`title = $${idx++}`);
      values.push(body.title);
    }
    if (body.body !== undefined) {
      sets.push(`body = $${idx++}`);
      values.push(body.body);
    }

    if (sets.length === 0) return badRequest('Nothing to update');

    values.push(postId);
    await pool.query<Record<string, unknown>>(`UPDATE posts SET ${sets.join(', ')} WHERE id = $${idx}`, values);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}

// Delete post
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const postId = Number(id);

    // Verify ownership (or admin)
    const { rows } = await pool.query<Record<string, unknown>>('SELECT author_id FROM posts WHERE id = $1', [postId]);
    if (!rows[0]) return notFound('Post not found');

    const user = await userRepo.findById(userId);
    if (Number(rows[0].author_id) !== userId && user?.role !== 'ADMIN') {
      return unauthorized('Not your post');
    }

    await pool.query<Record<string, unknown>>('DELETE FROM posts WHERE id = $1', [postId]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
