import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { pool } from '@/src/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const userId = await requireUserId();

    const { rows } = await pool.query(
      `SELECT email_notifications, notification_dm, notification_comments, notification_follows, notification_mentions
       FROM users WHERE id = $1`,
      [userId],
    );

    if (rows.length === 0) {
      return badRequest('User not found');
    }

    const prefs = rows[0] as Record<string, boolean>;
    return NextResponse.json({
      emailNotifications: prefs.email_notifications,
      dm: prefs.notification_dm,
      comments: prefs.notification_comments,
      follows: prefs.notification_follows,
      mentions: prefs.notification_mentions,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed';
    if (msg === 'Not authenticated') return unauthorized(msg);
    return badRequest(msg);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const fields: Record<string, string> = {
      emailNotifications: 'email_notifications',
      dm: 'notification_dm',
      comments: 'notification_comments',
      follows: 'notification_follows',
      mentions: 'notification_mentions',
    };

    for (const [key, column] of Object.entries(fields)) {
      if (typeof body[key] === 'boolean') {
        updates.push(`${column} = $${idx++}`);
        values.push(body[key]);
      }
    }

    if (updates.length === 0) {
      return badRequest('No valid fields to update');
    }

    values.push(userId);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`,
      values,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed';
    if (msg === 'Not authenticated') return unauthorized(msg);
    return badRequest(msg);
  }
}
