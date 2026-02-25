import { getPostDetail } from '@/src/application/use-cases/post/get-post-detail';
import { createComment } from '@/src/application/use-cases/community/create-comment';
import { PgPostRepository } from '@/src/infrastructure/repositories/pg-post-repository';
import { PgCommunityRepository } from '@/src/infrastructure/repositories/pg-community-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { checkRateLimit } from '@/src/interfaces/http/rate-limiter';
import { badRequest, unauthorized, tooManyRequests } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const postRepo = new PgPostRepository();
const communityRepo = new PgCommunityRepository();

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const postId = Number(id);
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') === 'new' ? 'new' : 'best';

  const post = await getPostDetail(postRepo, postId, null, sort);
  if (!post) return badRequest('Post not found');

  return NextResponse.json({ comments: post.comments });
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    if (!checkRateLimit(userId, 'comments')) {
      return tooManyRequests('Too many comments. Try again later.');
    }
    const { id } = await context.params;
    const postId = Number(id);
    const body = await request.json();

    const created = await createComment(communityRepo, {
      authorId: userId,
      postId,
      parentCommentId: body.parentCommentId ? Number(body.parentCommentId) : null,
      body: body.body,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
