import {
  CommunityRepository,
  CreateCommentCommand,
  CreatePostCommand,
  ToggleVoteCommand,
} from '@/src/application/ports/community-repository';
import { pool } from '@/src/lib/db';

export class PgCommunityRepository implements CommunityRepository {
  async createPost(input: CreatePostCommand): Promise<{ id: number }> {
    const result = await pool.query(
      `INSERT INTO posts (author_id, type, title, body, scope_usa, scope_region, region_id, state_code, metro_area, image_url, community_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
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
        input.imageUrl ?? null,
        input.communityId ?? null,
      ],
    );

    return { id: Number((result.rows[0] as { id: number }).id) };
  }

  async createComment(input: CreateCommentCommand): Promise<{ id: number }> {
    const result = await pool.query(
      `INSERT INTO comments (post_id, author_id, parent_comment_id, body)
       VALUES ($1,$2,$3,$4)
       RETURNING id`,
      [input.postId, input.authorId, input.parentCommentId ?? null, input.body],
    );

    return { id: Number((result.rows[0] as { id: number }).id) };
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

  async getPostAuthorId(postId: number): Promise<number | null> {
    const { rows } = await pool.query(
      'SELECT author_id FROM posts WHERE id = $1',
      [postId],
    );
    return rows[0] ? Number((rows[0] as { author_id: number }).author_id) : null;
  }

  async getPostType(postId: number): Promise<string | null> {
    const { rows } = await pool.query(
      'SELECT type FROM posts WHERE id = $1',
      [postId],
    );
    return rows[0] ? (rows[0] as { type: string }).type : null;
  }

  async setAcceptedAnswer(postId: number, commentId: number | null): Promise<void> {
    await pool.query(
      'UPDATE posts SET accepted_comment_id = $1 WHERE id = $2',
      [commentId, postId],
    );
  }
}
