import {
  NotificationRepository,
  Notification,
  CreateNotificationInput,
} from '@/src/application/ports/notification-repository';
import { pool } from '@/src/lib/db';

export class PgNotificationRepository implements NotificationRepository {
  async create(input: CreateNotificationInput): Promise<void> {
    // Don't notify yourself
    if (input.actorId && input.actorId === input.userId) return;

    await pool.query(
      `INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id, message_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        input.userId,
        input.type,
        input.actorId ?? null,
        input.postId ?? null,
        input.commentId ?? null,
        input.messageId ?? null,
      ],
    );
  }

  async getByUser(
    userId: number,
    cursor?: number,
    limit = 20,
  ): Promise<{ items: Notification[]; nextCursor: number | null }> {
    const safeLimit = Math.min(limit, 50);
    const conditions = ['n.user_id = $1'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (cursor) {
      conditions.push(`n.id < $${idx++}`);
      values.push(cursor);
    }

    values.push(safeLimit + 1);

    const sql = `
      SELECT
        n.id, n.user_id, n.type, n.actor_id,
        a.display_name AS actor_display_name,
        n.post_id, p.title AS post_title,
        n.comment_id, n.message_id,
        n.is_read, n.created_at
      FROM notifications n
      LEFT JOIN users a ON a.id = n.actor_id
      LEFT JOIN posts p ON p.id = n.post_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY n.created_at DESC, n.id DESC
      LIMIT $${idx}
    `;

    const { rows } = await pool.query(sql, values);
    const hasMore = rows.length > safeLimit;
    const resultRows = hasMore ? rows.slice(0, safeLimit) : rows;

    const items: Notification[] = resultRows.map((r: Record<string, unknown>) => ({
      id: Number(r.id),
      userId: Number(r.user_id),
      type: String(r.type) as Notification['type'],
      actorId: r.actor_id ? Number(r.actor_id) : null,
      actorDisplayName: r.actor_display_name ? String(r.actor_display_name) : null,
      postId: r.post_id ? Number(r.post_id) : null,
      postTitle: r.post_title ? String(r.post_title) : null,
      commentId: r.comment_id ? Number(r.comment_id) : null,
      messageId: r.message_id ? Number(r.message_id) : null,
      isRead: Boolean(r.is_read),
      createdAt: String(r.created_at),
    }));

    const last = items[items.length - 1];
    return { items, nextCursor: hasMore && last ? last.id : null };
  }

  async getUnreadCount(userId: number): Promise<number> {
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId],
    );
    return Number(rows[0]?.count ?? 0);
  }

  async markAsRead(userId: number, notificationId: number): Promise<void> {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [notificationId, userId],
    );
  }

  async markAllAsRead(userId: number): Promise<void> {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
      [userId],
    );
  }
}
