import {
  FollowRepository,
  FollowCounts,
} from '@/src/application/ports/follow-repository';
import { pool } from '@/src/lib/db';

export class PgFollowRepository implements FollowRepository {
  async toggle(followerId: number, followingId: number): Promise<{ following: boolean }> {
    if (followerId === followingId) throw new Error('Cannot follow yourself');

    const del = await pool.query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId],
    );

    if (del.rowCount && del.rowCount > 0) {
      return { following: false };
    }

    await pool.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [followerId, followingId],
    );
    return { following: true };
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const { rows } = await pool.query(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId],
    );
    return rows.length > 0;
  }

  async getCounts(userId: number): Promise<FollowCounts> {
    const { rows } = await pool.query(
      `SELECT
        (SELECT COUNT(*)::int FROM follows WHERE following_id = $1) AS followers,
        (SELECT COUNT(*)::int FROM follows WHERE follower_id = $1) AS following`,
      [userId],
    );
    return {
      followers: Number(rows[0]?.followers ?? 0),
      following: Number(rows[0]?.following ?? 0),
    };
  }

  async getFollowers(userId: number, cursor?: number, limit = 20) {
    const safeLimit = Math.min(limit, 50);
    const conditions = ['f.following_id = $1'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (cursor) {
      conditions.push(`f.id < $${idx++}`);
      values.push(cursor);
    }
    values.push(safeLimit + 1);

    const sql = `
      SELECT f.id, u.id AS user_id, u.display_name, f.created_at
      FROM follows f
      JOIN users u ON u.id = f.follower_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY f.created_at DESC
      LIMIT $${idx}
    `;

    const { rows } = await pool.query(sql, values);
    const hasMore = rows.length > safeLimit;
    const resultRows = hasMore ? rows.slice(0, safeLimit) : rows;

    const items = resultRows.map((r: Record<string, unknown>) => ({
      id: Number(r.user_id),
      displayName: String(r.display_name),
      createdAt: String(r.created_at),
    }));

    const lastRow = hasMore ? resultRows[resultRows.length - 1] : null;
    return { items, nextCursor: lastRow ? Number((lastRow as Record<string, unknown>).id) : null };
  }

  async getFollowing(userId: number, cursor?: number, limit = 20) {
    const safeLimit = Math.min(limit, 50);
    const conditions = ['f.follower_id = $1'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (cursor) {
      conditions.push(`f.id < $${idx++}`);
      values.push(cursor);
    }
    values.push(safeLimit + 1);

    const sql = `
      SELECT f.id, u.id AS user_id, u.display_name, f.created_at
      FROM follows f
      JOIN users u ON u.id = f.following_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY f.created_at DESC
      LIMIT $${idx}
    `;

    const { rows } = await pool.query(sql, values);
    const hasMore = rows.length > safeLimit;
    const resultRows = hasMore ? rows.slice(0, safeLimit) : rows;

    const items = resultRows.map((r: Record<string, unknown>) => ({
      id: Number(r.user_id),
      displayName: String(r.display_name),
      createdAt: String(r.created_at),
    }));

    const lastRow = hasMore ? resultRows[resultRows.length - 1] : null;
    return { items, nextCursor: lastRow ? Number((lastRow as Record<string, unknown>).id) : null };
  }
}
