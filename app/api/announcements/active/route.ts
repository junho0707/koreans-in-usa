import { pool } from '@/src/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if the announcements table exists
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'announcements'
      ) AS exists`
    );

    if (!(tableCheck.rows[0] as { exists: boolean }).exists) {
      return NextResponse.json({ announcement: null });
    }

    const { rows } = await pool.query(
      `SELECT id, title, body, type
       FROM announcements
       WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at DESC
       LIMIT 1`
    );

    return NextResponse.json({
      announcement: rows[0]
        ? {
            id: Number((rows[0] as Record<string, unknown>).id),
            title: String((rows[0] as Record<string, unknown>).title),
            body: (rows[0] as Record<string, unknown>).body ? String((rows[0] as Record<string, unknown>).body) : '',
            type: String((rows[0] as Record<string, unknown>).type) as 'info' | 'warning' | 'success',
          }
        : null,
    });
  } catch {
    return NextResponse.json({ announcement: null });
  }
}
