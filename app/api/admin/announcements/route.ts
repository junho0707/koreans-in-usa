import { pool } from '@/src/lib/db';
import { requireUserId } from '@/src/interfaces/http/auth';
import { requireAdmin } from '@/src/interfaces/http/require-admin';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const userId = await requireUserId();
    await requireAdmin(userId);

    const { rows } = await pool.query<Record<string, unknown>>(
      `SELECT id, title, body, type, is_active, expires_at, created_at
       FROM announcements
       ORDER BY created_at DESC
       LIMIT 50`
    );

    const items = rows.map((r) => ({
      id: Number(r.id),
      title: String(r.title),
      body: r.body ? String(r.body) : '',
      type: String(r.type),
      isActive: Boolean(r.is_active),
      expiresAt: r.expires_at ? String(r.expires_at) : null,
      createdAt: String(r.created_at),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated' || message === 'Admin access required') return unauthorized(message);
    return badRequest(message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    await requireAdmin(userId);

    const body = await request.json();
    const { title, body: content, type = 'info', expiresAt } = body;

    if (!title?.trim()) return badRequest('Title required');
    if (!['info', 'warning', 'success'].includes(type)) return badRequest('Invalid type');

    const { rows } = await pool.query<Record<string, unknown>>(
      `INSERT INTO announcements (title, body, type, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [title, content || null, type, expiresAt || null]
    );

    return NextResponse.json({ id: Number(rows[0].id) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated' || message === 'Admin access required') return unauthorized(message);
    return badRequest(message);
  }
}
