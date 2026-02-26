import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

// Strip sslmode from URL to prevent pg from treating 'require' as 'verify-full'
// and apply our own ssl config with rejectUnauthorized: false for Supabase pooler
const connectionString = process.env.DATABASE_URL.replace(
  /[?&]sslmode=[^&]*/g,
  (match) => match.startsWith('?') ? '?' : '',
).replace(/\?$/, '');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
} as any);
