import {
  CreateFromAuthInput,
  UpdateProfileInput,
  UserRepository,
  UserPostSummary,
  UserCommentSummary,
} from '@/src/application/ports/user-repository';
import { User } from '@/src/domain/entities/user';
import { pool } from '@/src/lib/db';

type UserRow = {
  id: string | number;
  supabase_uid: string;
  email: string | null;
  phone: string | null;
  display_name: string;
  profile_state: string | null;
  country: string | null;
  city: string | null;
  interests: string[];
  korean_x_identity: string | null;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  reputation: string | number;
  badge: string | null;
  created_at: string;
};

function toUser(row: UserRow): User {
  return {
    id: Number(row.id),
    supabaseUid: row.supabase_uid,
    email: row.email,
    phone: row.phone,
    displayName: row.display_name,
    profileState: row.profile_state,
    country: row.country,
    city: row.city,
    interests: row.interests ?? [],
    koreanXIdentity: row.korean_x_identity,
    role: row.role,
    isActive: row.is_active,
    reputation: Number(row.reputation ?? 0),
    badge: row.badge,
    createdAt: row.created_at,
  };
}

const SELECT_FIELDS = `id, supabase_uid, email, phone, display_name, profile_state,
  country, city, interests, korean_x_identity, role, is_active, reputation, badge, created_at`;

export class PgUserRepository implements UserRepository {
  async findBySupabaseUid(uid: string): Promise<User | null> {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${SELECT_FIELDS} FROM users WHERE supabase_uid = $1`,
      [uid],
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async findById(id: number): Promise<User | null> {
    const { rows } = await pool.query<UserRow>(
      `SELECT ${SELECT_FIELDS} FROM users WHERE id = $1`,
      [id],
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async createFromAuth(input: CreateFromAuthInput): Promise<User> {
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (supabase_uid, email, phone, display_name)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SELECT_FIELDS}`,
      [input.supabaseUid, input.email, input.phone, input.displayName],
    );
    return toUser(rows[0]);
  }

  async updateProfile(id: number, input: UpdateProfileInput): Promise<User> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.displayName !== undefined) {
      sets.push(`display_name = $${idx++}`);
      values.push(input.displayName);
    }
    if (input.profileState !== undefined) {
      sets.push(`profile_state = $${idx++}`);
      values.push(input.profileState);
    }
    if (input.country !== undefined) {
      sets.push(`country = $${idx++}`);
      values.push(input.country);
    }
    if (input.city !== undefined) {
      sets.push(`city = $${idx++}`);
      values.push(input.city);
    }
    if (input.interests !== undefined) {
      sets.push(`interests = $${idx++}`);
      values.push(input.interests);
    }
    if (input.koreanXIdentity !== undefined) {
      sets.push(`korean_x_identity = $${idx++}`);
      values.push(input.koreanXIdentity);
    }

    if (sets.length === 0) {
      const user = await this.findById(id);
      if (!user) throw new Error('User not found');
      return user;
    }

    values.push(id);
    const { rows } = await pool.query<UserRow>(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx}
       RETURNING ${SELECT_FIELDS}`,
      values,
    );

    if (!rows[0]) throw new Error('User not found');
    return toUser(rows[0]);
  }

  async getPostsByUser(userId: number, cursor?: number, limit = 20): Promise<{ items: UserPostSummary[]; nextCursor: number | null }> {
    const safeLimit = Math.min(limit, 50);
    const conditions = ['p.author_id = $1', 'p.is_hidden = FALSE'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (cursor) {
      conditions.push(`p.id < $${idx++}`);
      values.push(cursor);
    }

    values.push(safeLimit + 1);

    const sql = `
      SELECT p.id, p.title, p.type, p.created_at,
        COALESCE(vs.score, 0)::int AS score,
        COALESCE(cc.cnt, 0)::int AS comment_count
      FROM posts p
      LEFT JOIN (SELECT target_id, COUNT(*)::int AS score FROM votes WHERE target_type = 'POST' GROUP BY target_id) vs ON vs.target_id = p.id
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS cnt FROM comments GROUP BY post_id) cc ON cc.post_id = p.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT $${idx}
    `;

    const { rows } = await pool.query(sql, values);
    const hasMore = rows.length > safeLimit;
    const resultRows = hasMore ? rows.slice(0, safeLimit) : rows;

    const items: UserPostSummary[] = resultRows.map((r: Record<string, unknown>) => ({
      id: Number(r.id),
      title: String(r.title),
      type: String(r.type),
      score: Number(r.score),
      commentCount: Number(r.comment_count),
      createdAt: String(r.created_at),
    }));

    const last = items[items.length - 1];
    return { items, nextCursor: hasMore && last ? last.id : null };
  }

  async getCommentsByUser(userId: number, cursor?: number, limit = 20): Promise<{ items: UserCommentSummary[]; nextCursor: number | null }> {
    const safeLimit = Math.min(limit, 50);
    const conditions = ['c.author_id = $1', 'c.is_hidden = FALSE'];
    const values: unknown[] = [userId];
    let idx = 2;

    if (cursor) {
      conditions.push(`c.id < $${idx++}`);
      values.push(cursor);
    }

    values.push(safeLimit + 1);

    const sql = `
      SELECT c.id, c.post_id, p.title AS post_title, c.body, c.created_at,
        COALESCE(vs.score, 0)::int AS score
      FROM comments c
      JOIN posts p ON p.id = c.post_id
      LEFT JOIN (SELECT target_id, COUNT(*)::int AS score FROM votes WHERE target_type = 'COMMENT' GROUP BY target_id) vs ON vs.target_id = c.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY c.created_at DESC, c.id DESC
      LIMIT $${idx}
    `;

    const { rows } = await pool.query(sql, values);
    const hasMore = rows.length > safeLimit;
    const resultRows = hasMore ? rows.slice(0, safeLimit) : rows;

    const items: UserCommentSummary[] = resultRows.map((r: Record<string, unknown>) => ({
      id: Number(r.id),
      postId: Number(r.post_id),
      postTitle: String(r.post_title),
      body: String(r.body),
      score: Number(r.score),
      createdAt: String(r.created_at),
    }));

    const last = items[items.length - 1];
    return { items, nextCursor: hasMore && last ? last.id : null };
  }
}
