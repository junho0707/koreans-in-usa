import { pool } from '@/src/lib/db';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q')?.trim();
    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const { rows } = await pool.query<Record<string, unknown>>(
      `SELECT id, display_name FROM users
       WHERE is_active = TRUE AND LOWER(display_name) LIKE $1
       ORDER BY display_name
       LIMIT 10`,
      [`%${query.toLowerCase()}%`],
    );

    const users = rows.map((r) => ({
      id: Number(r.id),
      displayName: String(r.display_name),
    }));

    return NextResponse.json({ users });
  } catch {
    return badRequest('Search failed');
  }
}
