import { pool } from '@/src/lib/db';
import { badRequest } from '@/src/interfaces/http/response';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = `
      SELECT p.id, p.title, p.body, p.type,
        p.author_id, u.display_name AS author_display_name,
        p.region_id, p.created_at,
        COALESCE(vs.score, 0)::int AS score,
        COALESCE(cc.cnt, 0)::int AS comment_count
      FROM posts p
      JOIN users u ON u.id = p.author_id
      LEFT JOIN (SELECT target_id, COUNT(*)::int AS score FROM votes WHERE target_type = 'POST' GROUP BY target_id) vs ON vs.target_id = p.id
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS cnt FROM comments GROUP BY post_id) cc ON cc.post_id = p.id
      WHERE p.is_pinned = TRUE AND p.is_hidden = FALSE
      ORDER BY p.created_at DESC
      LIMIT 5
    `;

    const { rows } = await pool.query(sql);
    const items = rows.map((r: Record<string, unknown>) => ({
      id: Number(r.id),
      title: String(r.title),
      type: String(r.type),
      authorDisplayName: String(r.author_display_name),
      score: Number(r.score),
      commentCount: Number(r.comment_count),
      createdAt: String(r.created_at),
    }));

    return NextResponse.json({ items });
  } catch {
    return badRequest('Failed');
  }
}
