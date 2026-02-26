import { PostRepository, PostDetailRow } from '@/src/application/ports/post-repository';
import { Comment } from '@/src/domain/entities/comment';
import { pool } from '@/src/lib/db';

type PostRow = {
  id: string | number;
  author_id: string | number;
  author_display_name: string;
  type: string;
  title: string;
  body: string;
  scope_usa: boolean;
  scope_region: boolean;
  region_id: string | null;
  state_code: string | null;
  metro_area: string | null;
  score: string | number;
  comment_count: string | number;
  accepted_comment_id: string | number | null;
  tags: string[] | null;
  viewer_voted: boolean;
  view_count: string | number;
  image_url: string | null;
  created_at: string;
};

type CommentRow = {
  id: string | number;
  post_id: string | number;
  author_id: string | number;
  author_display_name: string;
  parent_comment_id: string | number | null;
  body: string;
  score: string | number;
  created_at: string;
};

export class PgPostRepository implements PostRepository {
  async getPostById(postId: number, viewerUserId: number | null): Promise<PostDetailRow | null> {
    const sql = `
      SELECT
        p.id, p.author_id, u.display_name AS author_display_name,
        p.type, p.title, p.body,
        p.scope_usa, p.scope_region, p.region_id,
        p.state_code, p.metro_area,
        p.accepted_comment_id,
        p.image_url,
        COALESCE(p.view_count, 0)::int AS view_count,
        p.created_at,
        COALESCE(vs.score, 0)::int AS score,
        COALESCE(cc.cnt, 0)::int AS comment_count,
        COALESCE(
          ARRAY(
            SELECT tt.slug FROM post_topic_tags ptt
            JOIN topic_tags tt ON tt.id = ptt.topic_tag_id
            WHERE ptt.post_id = p.id
          ), '{}'
        ) AS tags,
        CASE WHEN vv.id IS NOT NULL THEN TRUE ELSE FALSE END AS viewer_voted
      FROM posts p
      JOIN users u ON u.id = p.author_id
      LEFT JOIN (
        SELECT target_id, COUNT(*)::int AS score
        FROM votes WHERE target_type = 'POST'
        GROUP BY target_id
      ) vs ON vs.target_id = p.id
      LEFT JOIN (
        SELECT post_id, COUNT(*)::int AS cnt
        FROM comments
        GROUP BY post_id
      ) cc ON cc.post_id = p.id
      LEFT JOIN votes vv ON vv.target_type = 'POST' AND vv.target_id = p.id AND vv.user_id = $2
      WHERE p.id = $1
    `;

    const { rows } = await pool.query<PostRow>(sql, [postId, viewerUserId]);
    const row = rows[0];
    if (!row) return null;

    return {
      id: Number(row.id),
      authorId: Number(row.author_id),
      authorDisplayName: row.author_display_name,
      type: row.type,
      title: row.title,
      body: row.body,
      scopeUsa: row.scope_usa,
      scopeRegion: row.scope_region,
      regionId: row.region_id,
      stateCode: row.state_code,
      metroArea: row.metro_area,
      score: Number(row.score),
      commentCount: Number(row.comment_count),
      acceptedCommentId: row.accepted_comment_id ? Number(row.accepted_comment_id) : null,
      tags: row.tags ?? [],
      viewerVoted: row.viewer_voted,
      viewCount: Number(row.view_count),
      imageUrl: row.image_url,
      createdAt: row.created_at,
    };
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    const sql = `
      SELECT
        c.id, c.post_id, c.author_id, u.display_name AS author_display_name,
        c.parent_comment_id, c.body, c.created_at,
        COALESCE(vs.score, 0)::int AS score
      FROM comments c
      JOIN users u ON u.id = c.author_id
      LEFT JOIN (
        SELECT target_id, COUNT(*)::int AS score
        FROM votes WHERE target_type = 'COMMENT'
        GROUP BY target_id
      ) vs ON vs.target_id = c.id
      WHERE c.post_id = $1 AND c.is_hidden = FALSE
      ORDER BY c.created_at ASC
    `;

    const { rows } = await pool.query<CommentRow>(sql, [postId]);
    return rows.map((row) => ({
      id: Number(row.id),
      postId: Number(row.post_id),
      authorId: Number(row.author_id),
      authorDisplayName: row.author_display_name,
      parentCommentId: row.parent_comment_id ? Number(row.parent_comment_id) : null,
      body: row.body,
      score: Number(row.score),
      createdAt: row.created_at,
    }));
  }
}
