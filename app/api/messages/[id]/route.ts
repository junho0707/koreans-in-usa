import { PgMessageRepository } from '@/src/infrastructure/repositories/pg-message-repository';
import { PgNotificationRepository } from '@/src/infrastructure/repositories/pg-notification-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { checkRateLimit } from '@/src/interfaces/http/rate-limiter';
import { badRequest, unauthorized, tooManyRequests } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/src/lib/db';

const repo = new PgMessageRepository();
const notifRepo = new PgNotificationRepository();

// Get messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const conversationId = Number(id);
    const cursor = request.nextUrl.searchParams.get('cursor') ? Number(request.nextUrl.searchParams.get('cursor')) : undefined;

    const result = await repo.getMessages(conversationId, userId, cursor);

    // Mark as read
    repo.markConversationRead(conversationId, userId).catch(() => {});

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}

// Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    if (!checkRateLimit(userId, 'comments')) {
      return tooManyRequests('Slow down. Try again later.');
    }
    const { id } = await params;
    const conversationId = Number(id);
    const body = await request.json();
    const messageBody = body.body?.trim();
    if (!messageBody) return badRequest('Message body is required');

    const message = await repo.sendMessage(conversationId, userId, messageBody);

    // Notify receiver (non-blocking)
    (async () => {
      try {
        const { rows } = await pool.query<Record<string, unknown>>(
          'SELECT user_a_id, user_b_id FROM conversations WHERE id = $1',
          [conversationId],
        );
        if (rows[0]) {
          const receiverId = Number(rows[0].user_a_id) === userId
            ? Number(rows[0].user_b_id)
            : Number(rows[0].user_a_id);
          await notifRepo.create({
            userId: receiverId,
            type: 'DM_RECEIVED',
            actorId: userId,
            messageId: message.id,
          });
        }
      } catch {}
    })();

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
