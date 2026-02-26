import { PgNotificationRepository } from '@/src/infrastructure/repositories/pg-notification-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgNotificationRepository();

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { searchParams } = request.nextUrl;
    const cursor = searchParams.get('cursor') ? Number(searchParams.get('cursor')) : undefined;

    const [result, unreadCount] = await Promise.all([
      repo.getByUser(userId, cursor),
      repo.getUnreadCount(userId),
    ]);

    return NextResponse.json({ ...result, unreadCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
