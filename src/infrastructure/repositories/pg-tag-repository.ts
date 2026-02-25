import { CreateTagInput, TagRepository } from '@/src/application/ports/tag-repository';
import { TopicTag } from '@/src/domain/entities/topic-tag';
import { pool } from '@/src/lib/db';

type TagRow = {
  id: string | number;
  slug: string;
  name: string;
  keywords: string[];
  created_at: string;
};

function toTag(row: TagRow): TopicTag {
  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    keywords: row.keywords ?? [],
    createdAt: row.created_at,
  };
}

export class PgTagRepository implements TagRepository {
  async getAllTags(): Promise<TopicTag[]> {
    const { rows } = await pool.query<TagRow>(
      'SELECT id, slug, name, keywords, created_at FROM topic_tags ORDER BY name',
    );
    return rows.map(toTag);
  }

  async setPostTags(postId: number, tagIds: number[], source: 'USER' | 'AUTO'): Promise<void> {
    if (tagIds.length === 0) return;

    const values = tagIds.map((_, i) => `($1, $${i + 2}, $${tagIds.length + 2})`).join(', ');
    await pool.query(
      `INSERT INTO post_topic_tags (post_id, topic_tag_id, source) VALUES ${values}
       ON CONFLICT (post_id, topic_tag_id) DO NOTHING`,
      [postId, ...tagIds, source],
    );
  }

  async getTagsByPostId(postId: number): Promise<TopicTag[]> {
    const { rows } = await pool.query<TagRow>(
      `SELECT tt.id, tt.slug, tt.name, tt.keywords, tt.created_at
       FROM topic_tags tt
       JOIN post_topic_tags ptt ON ptt.topic_tag_id = tt.id
       WHERE ptt.post_id = $1`,
      [postId],
    );
    return rows.map(toTag);
  }

  async createTag(input: CreateTagInput): Promise<TopicTag> {
    const { rows } = await pool.query<TagRow>(
      `INSERT INTO topic_tags (slug, name, keywords) VALUES ($1, $2, $3)
       RETURNING id, slug, name, keywords, created_at`,
      [input.slug, input.name, input.keywords],
    );
    return toTag(rows[0]);
  }

  async updateTag(id: number, input: Partial<CreateTagInput>): Promise<TopicTag> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.slug !== undefined) { sets.push(`slug = $${idx++}`); values.push(input.slug); }
    if (input.name !== undefined) { sets.push(`name = $${idx++}`); values.push(input.name); }
    if (input.keywords !== undefined) { sets.push(`keywords = $${idx++}`); values.push(input.keywords); }

    if (sets.length === 0) {
      const { rows } = await pool.query<TagRow>(
        'SELECT id, slug, name, keywords, created_at FROM topic_tags WHERE id = $1', [id],
      );
      if (!rows[0]) throw new Error('Tag not found');
      return toTag(rows[0]);
    }

    values.push(id);
    const { rows } = await pool.query<TagRow>(
      `UPDATE topic_tags SET ${sets.join(', ')} WHERE id = $${idx}
       RETURNING id, slug, name, keywords, created_at`,
      values,
    );
    if (!rows[0]) throw new Error('Tag not found');
    return toTag(rows[0]);
  }

  async deleteTag(id: number): Promise<void> {
    await pool.query('DELETE FROM topic_tags WHERE id = $1', [id]);
  }
}
