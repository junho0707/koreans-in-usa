import { getPostDetail } from '@/src/application/use-cases/post/get-post-detail';
import { PgPostRepository } from '@/src/infrastructure/repositories/pg-post-repository';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import { getOrCreateUser } from '@/src/application/use-cases/user/get-or-create-user';
import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { notFound } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

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
