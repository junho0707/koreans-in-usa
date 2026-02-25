import { toggleVote } from '@/src/application/use-cases/community/toggle-vote';
import { PgCommunityRepository } from '@/src/infrastructure/repositories/pg-community-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunityRepository();

export async function POST(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    const result = await toggleVote(repo, {
      userId,
      targetType: body.targetType,
      targetId: Number(body.targetId),
    });

    return NextResponse.json(result);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid request');
  }
}
