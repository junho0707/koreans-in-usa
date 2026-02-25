import { createComment } from '@/src/application/use-cases/community/create-comment';
import { PgCommunityRepository } from '@/src/infrastructure/repositories/pg-community-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunityRepository();

export async function POST(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    const created = await createComment(repo, {
      authorId: userId,
      postId: Number(body.postId),
      parentCommentId: body.parentCommentId ? Number(body.parentCommentId) : null,
      body: body.body,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid request');
  }
}
