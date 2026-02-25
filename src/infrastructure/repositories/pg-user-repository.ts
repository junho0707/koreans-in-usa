import {
  CreateFromAuthInput,
  UpdateProfileInput,
  UserRepository,
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
    createdAt: row.created_at,
  };
}

const SELECT_FIELDS = `id, supabase_uid, email, phone, display_name, profile_state,
  country, city, interests, korean_x_identity, role, is_active, created_at`;

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
}
