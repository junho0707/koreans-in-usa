import {
  CreateReportInput,
  ModerationRepository,
  ReportedItem,
} from '@/src/application/ports/moderation-repository';
import { Report, ReportTargetType } from '@/src/domain/entities/report';
import { pool } from '@/src/lib/db';

type ReportRow = {
  id: string | number;
  reporter_id: string | number;
  target_type: string;
  target_id: string | number;
  reason: string;
  created_at: string;
};

type ReportedRow = {
  target_type: string;
  target_id: string | number;
  report_count: string | number;
  is_hidden: boolean;
  content: string;
  author_display_name: string;
};

const AUTO_HIDE_THRESHOLD = 10;

export class PgModerationRepository implements ModerationRepository {
  async createReport(input: CreateReportInput): Promise<Report> {
    const { rows } = await pool.query<ReportRow>(
      `INSERT INTO reports (reporter_id, target_type, target_id, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING id, reporter_id, target_type, target_id, reason, created_at`,
      [input.reporterId, input.targetType, input.targetId, input.reason],
    );
    const row = rows[0];
    return {
      id: Number(row.id),
      reporterId: Number(row.reporter_id),
      targetType: row.target_type as ReportTargetType,
      targetId: Number(row.target_id),
      reason: row.reason,
      createdAt: row.created_at,
    };
  }

  async incrementReportCount(targetType: ReportTargetType, targetId: number): Promise<number> {
    const table = targetType === 'POST' ? 'posts' : 'comments';
    const { rows } = await pool.query(
      `UPDATE ${table} SET report_count = report_count + 1 WHERE id = $1
       RETURNING report_count`,
      [targetId],
    );
    const count = Number((rows[0] as { report_count: number }).report_count);

    // Auto-hide at threshold
    if (count >= AUTO_HIDE_THRESHOLD) {
      await pool.query(
        `UPDATE ${table} SET is_hidden = TRUE WHERE id = $1`,
        [targetId],
      );
    }

    return count;
  }

  async hideContent(targetType: ReportTargetType, targetId: number): Promise<void> {
    const table = targetType === 'POST' ? 'posts' : 'comments';
    await pool.query(`UPDATE ${table} SET is_hidden = TRUE WHERE id = $1`, [targetId]);
  }

  async unhideContent(targetType: ReportTargetType, targetId: number): Promise<void> {
    const table = targetType === 'POST' ? 'posts' : 'comments';
    await pool.query(`UPDATE ${table} SET is_hidden = FALSE WHERE id = $1`, [targetId]);
  }

  async getReportedContent(limit: number, offset: number): Promise<ReportedItem[]> {
    const { rows } = await pool.query<ReportedRow>(
      `(
        SELECT 'POST' AS target_type, p.id AS target_id, p.report_count,
          p.is_hidden, p.title || ': ' || LEFT(p.body, 200) AS content,
          u.display_name AS author_display_name
        FROM posts p JOIN users u ON u.id = p.author_id
        WHERE p.report_count > 0
      )
      UNION ALL
      (
        SELECT 'COMMENT' AS target_type, c.id AS target_id, c.report_count,
          c.is_hidden, LEFT(c.body, 200) AS content,
          u.display_name AS author_display_name
        FROM comments c JOIN users u ON u.id = c.author_id
        WHERE c.report_count > 0
      )
      ORDER BY report_count DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return rows.map((row) => ({
      id: Number(row.target_id),
      targetType: row.target_type as ReportTargetType,
      targetId: Number(row.target_id),
      reportCount: Number(row.report_count),
      isHidden: row.is_hidden,
      content: row.content,
      authorDisplayName: row.author_display_name,
    }));
  }

  async getReportCount(targetType: ReportTargetType, targetId: number): Promise<number> {
    const table = targetType === 'POST' ? 'posts' : 'comments';
    const { rows } = await pool.query(
      `SELECT report_count FROM ${table} WHERE id = $1`,
      [targetId],
    );
    return rows[0] ? Number((rows[0] as { report_count: number }).report_count) : 0;
  }
}
