import { PgMessageRepository } from '@/src/infrastructure/repositories/pg-message-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgMessageRepository();

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const cursor = request.nextUrl.searchParams.get('cursor') ? Number(request.nextUrl.searchParams.get('cursor')) : undefined;

    const [result, unreadTotal] = await Promise.all([
      repo.getConversations(userId, cursor),
      repo.getUnreadTotal(userId),
    ]);

    return NextResponse.json({ ...result, unreadTotal });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}

// Create or get conversation with a user
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const targetUserId = Number(body.userId);
    if (!targetUserId) return badRequest('userId is required');
    if (targetUserId === userId) return badRequest('Cannot message yourself');

    const conversationId = await repo.getOrCreateConversation(userId, targetUserId);
    return NextResponse.json({ conversationId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
