import {
  MessageRepository,
  Conversation,
  Message,
} from '@/src/application/ports/message-repository';
import { pool } from '@/src/lib/db';

export class PgMessageRepository implements MessageRepository {
  async getConversations(userId: number, cursor?: number, limit = 20) {
    const safeLimit = Math.min(limit, 50);
    const conditions = ['(c.user_a_id = $1 OR c.user_b_id = $1)'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (cursor) {
      conditions.push(`c.id < $${idx++}`);
      values.push(cursor);
    }
    values.push(safeLimit + 1);

    const sql = `
      SELECT
        c.id,
        CASE WHEN c.user_a_id = $1 THEN c.user_b_id ELSE c.user_a_id END AS other_user_id,
        u.display_name AS other_display_name,
        c.last_message_at,
        (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_body,
        (SELECT COUNT(*)::int FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND is_read = FALSE) AS unread_count
      FROM conversations c
      JOIN users u ON u.id = CASE WHEN c.user_a_id = $1 THEN c.user_b_id ELSE c.user_a_id END
      WHERE ${conditions.join(' AND ')}
      ORDER BY c.last_message_at DESC
      LIMIT $${idx}
    `;

    const { rows } = await pool.query(sql, values);
    const hasMore = rows.length > safeLimit;
    const resultRows = hasMore ? rows.slice(0, safeLimit) : rows;

    const items: Conversation[] = resultRows.map((r: Record<string, unknown>) => ({
      id: Number(r.id),
      otherUserId: Number(r.other_user_id),
      otherDisplayName: String(r.other_display_name),
      lastMessageBody: String(r.last_message_body ?? ''),
      lastMessageAt: String(r.last_message_at),
      unreadCount: Number(r.unread_count),
    }));

    const last = items[items.length - 1];
    return { items, nextCursor: hasMore && last ? last.id : null };
  }

  async getOrCreateConversation(userAId: number, userBId: number): Promise<number> {
    const [a, b] = userAId < userBId ? [userAId, userBId] : [userBId, userAId];

    // Try to find existing
    const { rows: existing } = await pool.query(
      'SELECT id FROM conversations WHERE user_a_id = $1 AND user_b_id = $2',
      [a, b],
    );
    if (existing[0]) return Number(existing[0].id);

    // Create new
    const { rows } = await pool.query(
      'INSERT INTO conversations (user_a_id, user_b_id) VALUES ($1, $2) ON CONFLICT (user_a_id, user_b_id) DO UPDATE SET user_a_id = conversations.user_a_id RETURNING id',
      [a, b],
    );
    return Number(rows[0].id);
  }

  async getMessages(conversationId: number, userId: number, cursor?: number, limit = 30) {
    const safeLimit = Math.min(limit, 50);
    const conditions = ['m.conversation_id = $1'];
    const values: unknown[] = [conversationId];
    let idx = 2;

    // Verify user is part of conversation
    const { rows: check } = await pool.query(
      'SELECT 1 FROM conversations WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2)',
      [conversationId, userId],
    );
    if (!check[0]) throw new Error('Conversation not found');

    if (cursor) {
      conditions.push(`m.id < $${idx++}`);
      values.push(cursor);
    }
    values.push(safeLimit + 1);

    const sql = `
      SELECT m.id, m.conversation_id, m.sender_id, u.display_name AS sender_display_name,
        m.body, m.is_read, m.created_at
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT $${idx}
    `;

    const { rows } = await pool.query(sql, values);
    const hasMore = rows.length > safeLimit;
    const resultRows = hasMore ? rows.slice(0, safeLimit) : rows;

    const items: Message[] = resultRows.map((r: Record<string, unknown>) => ({
      id: Number(r.id),
      conversationId: Number(r.conversation_id),
      senderId: Number(r.sender_id),
      senderDisplayName: String(r.sender_display_name),
      body: String(r.body),
      isRead: Boolean(r.is_read),
      createdAt: String(r.created_at),
    }));

    const last = items[items.length - 1];
    return { items, nextCursor: hasMore && last ? last.id : null };
  }

  async sendMessage(conversationId: number, senderId: number, body: string): Promise<Message> {
    // Verify sender is part of conversation
    const { rows: check } = await pool.query(
      'SELECT 1 FROM conversations WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2)',
      [conversationId, senderId],
    );
    if (!check[0]) throw new Error('Conversation not found');

    const { rows } = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, body)
       VALUES ($1, $2, $3) RETURNING id, conversation_id, sender_id, body, is_read, created_at`,
      [conversationId, senderId, body],
    );

    // Update last_message_at
    await pool.query(
      'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
      [conversationId],
    );

    const r = rows[0];
    return {
      id: Number(r.id),
      conversationId: Number(r.conversation_id),
      senderId: Number(r.sender_id),
      senderDisplayName: '', // Caller knows the sender
      body: String(r.body),
      isRead: Boolean(r.is_read),
      createdAt: String(r.created_at),
    };
  }

  async markConversationRead(conversationId: number, userId: number): Promise<void> {
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE',
      [conversationId, userId],
    );
  }

  async getUnreadTotal(userId: number): Promise<number> {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE (c.user_a_id = $1 OR c.user_b_id = $1)
       AND m.sender_id != $1 AND m.is_read = FALSE`,
      [userId],
    );
    return Number(rows[0]?.count ?? 0);
  }
}
