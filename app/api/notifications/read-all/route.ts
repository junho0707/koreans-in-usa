import { PgNotificationRepository } from '@/src/infrastructure/repositories/pg-notification-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextResponse } from 'next/server';

const repo = new PgNotificationRepository();

export async function POST() {
  try {
    const userId = await requireUserId();
    await repo.markAllAsRead(userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
