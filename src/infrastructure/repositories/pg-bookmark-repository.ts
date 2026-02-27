import {
  BookmarkRepository,
  BookmarkedPost,
} from '@/src/application/ports/bookmark-repository';
import { pool } from '@/src/lib/db';

export class PgBookmarkRepository implements BookmarkRepository {
  async toggle(userId: number, postId: number): Promise<{ bookmarked: boolean }> {
    // Try to delete first; if nothing was deleted, insert
    const del = await pool.query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2',
      [userId, postId],
    );

    if (del.rowCount && del.rowCount > 0) {
      return { bookmarked: false };
    }

    await pool.query(
      'INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, postId],
    );
    return { bookmarked: true };
  }

  async isBookmarked(userId: number, postId: number): Promise<boolean> {
    const { rows } = await pool.query(
      'SELECT 1 FROM bookmarks WHERE user_id = $1 AND post_id = $2',
      [userId, postId],
    );
    return rows.length > 0;
  }

  async getByUser(
    userId: number,
    cursor?: number,
    limit = 20,
  ): Promise<{ items: BookmarkedPost[]; nextCursor: number | null }> {
    const safeLimit = Math.min(limit, 50);
    const conditions = ['b.user_id = $1'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (cursor) {
      conditions.push(`b.id < $${idx++}`);
      values.push(cursor);
    }

    values.push(safeLimit + 1);

    const sql = `
      SELECT
        b.id, b.post_id, p.title, p.type, u.display_name AS author_display_name,
        COALESCE(vs.score, 0)::int AS score,
        COALESCE(cc.cnt, 0)::int AS comment_count,
        p.created_at, b.created_at AS bookmarked_at
      FROM bookmarks b
      JOIN posts p ON p.id = b.post_id
      JOIN users u ON u.id = p.author_id
      LEFT JOIN (SELECT target_id, COUNT(*)::int AS score FROM votes WHERE target_type = 'POST' GROUP BY target_id) vs ON vs.target_id = p.id
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS cnt FROM comments GROUP BY post_id) cc ON cc.post_id = p.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY b.created_at DESC, b.id DESC
      LIMIT $${idx}
    `;

    const { rows } = await pool.query(sql, values);
    const hasMore = rows.length > safeLimit;
    const resultRows = hasMore ? rows.slice(0, safeLimit) : rows;

    const items: BookmarkedPost[] = (resultRows as Record<string, unknown>[]).map((r) => ({
      id: Number(r.id),
      postId: Number(r.post_id),
      title: String(r.title),
      type: String(r.type),
      authorDisplayName: String(r.author_display_name),
      score: Number(r.score),
      commentCount: Number(r.comment_count),
      createdAt: String(r.created_at),
      bookmarkedAt: String(r.bookmarked_at),
    }));

    const last = items[items.length - 1];
    return { items, nextCursor: hasMore && last ? last.id : null };
  }
}
