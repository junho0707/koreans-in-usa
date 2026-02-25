import {
  CommunityRepository,
  CreateCommentCommand,
  CreatePostCommand,
  ToggleVoteCommand,
} from '@/src/application/ports/community-repository';
import { pool } from '@/src/lib/db';

function getInsertedId(rows: unknown[]): number {
  const row = rows[0];
  if (!row || typeof row !== 'object' || !('id' in row)) {
    throw new Error('Insert failed: missing id');
  }
  return Number((row as { id: number | string }).id);
}

export class PgCommunityRepository implements CommunityRepository {
  async createPost(input: CreatePostCommand): Promise<{ id: number }> {
    const result = await pool.query(
      `INSERT INTO posts (author_id, type, title, body, scope_usa, scope_region, region_id, state_code, metro_area)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        input.authorId,
        input.type,
        input.title,
        input.body,
        input.scopeUsa,
        input.scopeRegion,
        input.regionId ?? null,
        input.stateCode ?? null,
        input.metroArea ?? null,
      ],
    );

    return { id: getInsertedId(result.rows as unknown[]) };
  }

  async createComment(input: CreateCommentCommand): Promise<{ id: number }> {
    const result = await pool.query(
      `INSERT INTO comments (post_id, author_id, parent_comment_id, body)
       VALUES ($1,$2,$3,$4)
       RETURNING id`,
      [input.postId, input.authorId, input.parentCommentId ?? null, input.body],
    );

    return { id: getInsertedId(result.rows as unknown[]) };
  }

  async toggleVote(input: ToggleVoteCommand): Promise<{ active: boolean }> {
    const deleted = await pool.query(
      `DELETE FROM votes
       WHERE user_id = $1 AND target_type = $2 AND target_id = $3
       RETURNING id`,
      [input.userId, input.targetType, input.targetId],
    );

    if (deleted.rowCount && deleted.rowCount > 0) {
      return { active: false };
    }

    await pool.query(
      `INSERT INTO votes (user_id, target_type, target_id)
       VALUES ($1,$2,$3)`,
      [input.userId, input.targetType, input.targetId],
    );

    return { active: true };
  }
}
