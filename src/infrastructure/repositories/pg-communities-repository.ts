import { CommunitiesPort, CreateCommunityInput, CreateEventInput } from '@/src/application/ports/communities-port';
import { Community, CommunityMember, CommunityEvent, EventRsvp, MemberRole, RsvpStatus } from '@/src/domain/entities/community';
import { pool } from '@/src/lib/db';

function toCommunity(row: Record<string, unknown>): Community {
  return {
    id: Number(row.id),
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) || null,
    scope: row.scope as Community['scope'],
    regionId: (row.region_id as string) || null,
    privacy: row.privacy as Community['privacy'],
    leaderId: Number(row.leader_id),
    kakaoLink: (row.kakao_link as string) || null,
    memberCount: Number(row.member_count),
    isActive: row.is_active as boolean,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

function toMember(row: Record<string, unknown>): CommunityMember {
  return {
    id: Number(row.id),
    communityId: Number(row.community_id),
    userId: Number(row.user_id),
    role: row.role as MemberRole,
    status: row.status as CommunityMember['status'],
    joinedAt: (row.joined_at as Date).toISOString(),
  };
}

function toEvent(row: Record<string, unknown>): CommunityEvent {
  return {
    id: Number(row.id),
    communityId: Number(row.community_id),
    creatorId: Number(row.creator_id),
    title: row.title as string,
    description: (row.description as string) || null,
    location: (row.location as string) || null,
    eventDate: (row.event_date as Date).toISOString(),
    eventEndDate: row.event_end_date ? (row.event_end_date as Date).toISOString() : null,
    isOnline: row.is_online as boolean,
    maxAttendees: Number(row.max_attendees || 0),
    createdAt: (row.created_at as Date).toISOString(),
  };
}

export class PgCommunitiesRepository implements CommunitiesPort {
  async create(input: CreateCommunityInput): Promise<Community> {
    const { rows } = await pool.query(
      `INSERT INTO communities (name, slug, description, scope, region_id, privacy, leader_id, kakao_link)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [input.name, input.slug, input.description || null, input.scope, input.regionId || null, input.privacy, input.leaderId, input.kakaoLink || null]
    );
    return toCommunity(rows[0] as Record<string, unknown>);
  }

  async findBySlug(slug: string): Promise<Community | null> {
    const { rows } = await pool.query('SELECT * FROM communities WHERE slug = $1 AND is_active = true', [slug]);
    return rows[0] ? toCommunity(rows[0] as Record<string, unknown>) : null;
  }

  async findById(id: number): Promise<Community | null> {
    const { rows } = await pool.query('SELECT * FROM communities WHERE id = $1 AND is_active = true', [id]);
    return rows[0] ? toCommunity(rows[0] as Record<string, unknown>) : null;
  }

  async update(id: number, fields: Partial<Pick<Community, 'name' | 'description' | 'privacy' | 'kakaoLink'>>): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    if (fields.name !== undefined) { sets.push(`name = $${i++}`); vals.push(fields.name); }
    if (fields.description !== undefined) { sets.push(`description = $${i++}`); vals.push(fields.description); }
    if (fields.privacy !== undefined) { sets.push(`privacy = $${i++}`); vals.push(fields.privacy); }
    if (fields.kakaoLink !== undefined) { sets.push(`kakao_link = $${i++}`); vals.push(fields.kakaoLink); }
    if (sets.length === 0) return;
    vals.push(id);
    await pool.query(`UPDATE communities SET ${sets.join(', ')} WHERE id = $${i}`, vals);
  }

  async listPublic(limit: number, offset: number): Promise<Community[]> {
    const { rows } = await pool.query(
      'SELECT * FROM communities WHERE is_active = true AND privacy = $1 ORDER BY member_count DESC, created_at DESC LIMIT $2 OFFSET $3',
      ['PUBLIC', limit, offset]
    );
    return (rows as Record<string, unknown>[]).map(toCommunity);
  }

  async listByRegion(regionId: string, limit: number, offset: number): Promise<Community[]> {
    const { rows } = await pool.query(
      'SELECT * FROM communities WHERE is_active = true AND region_id = $1 AND privacy = $2 ORDER BY member_count DESC LIMIT $3 OFFSET $4',
      [regionId, 'PUBLIC', limit, offset]
    );
    return (rows as Record<string, unknown>[]).map(toCommunity);
  }

  async listByUser(userId: number): Promise<Community[]> {
    const { rows } = await pool.query(
      `SELECT c.* FROM communities c
       JOIN community_members cm ON cm.community_id = c.id
       WHERE cm.user_id = $1 AND cm.status = 'ACTIVE' AND c.is_active = true
       ORDER BY c.name`,
      [userId]
    );
    return (rows as Record<string, unknown>[]).map(toCommunity);
  }

  async listPopular(limit: number): Promise<Community[]> {
    const { rows } = await pool.query(
      'SELECT * FROM communities WHERE is_active = true AND privacy = $1 ORDER BY member_count DESC LIMIT $2',
      ['PUBLIC', limit]
    );
    return (rows as Record<string, unknown>[]).map(toCommunity);
  }

  async searchByName(query: string, limit: number): Promise<Community[]> {
    const { rows } = await pool.query(
      'SELECT * FROM communities WHERE is_active = true AND privacy = $1 AND LOWER(name) LIKE $2 ORDER BY member_count DESC LIMIT $3',
      ['PUBLIC', `%${query.toLowerCase()}%`, limit]
    );
    return (rows as Record<string, unknown>[]).map(toCommunity);
  }

  async countCreatedByUser(userId: number): Promise<number> {
    const { rows } = await pool.query(
      'SELECT COUNT(*) as count FROM communities WHERE leader_id = $1 AND is_active = true',
      [userId]
    );
    return Number((rows[0] as { count: string }).count);
  }

  async addMember(communityId: number, userId: number, role: MemberRole, status: 'ACTIVE' | 'PENDING'): Promise<void> {
    await pool.query(
      `INSERT INTO community_members (community_id, user_id, role, status)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (community_id, user_id) DO UPDATE SET role = $3, status = $4`,
      [communityId, userId, role, status]
    );
    if (status === 'ACTIVE') {
      await pool.query('UPDATE communities SET member_count = member_count + 1 WHERE id = $1', [communityId]);
    }
  }

  async removeMember(communityId: number, userId: number): Promise<void> {
    const { rowCount } = await pool.query(
      `DELETE FROM community_members WHERE community_id = $1 AND user_id = $2 AND status = 'ACTIVE'`,
      [communityId, userId]
    );
    if (rowCount && rowCount > 0) {
      await pool.query('UPDATE communities SET member_count = GREATEST(member_count - 1, 0) WHERE id = $1', [communityId]);
    }
  }

  async getMember(communityId: number, userId: number): Promise<CommunityMember | null> {
    const { rows } = await pool.query(
      'SELECT * FROM community_members WHERE community_id = $1 AND user_id = $2',
      [communityId, userId]
    );
    return rows[0] ? toMember(rows[0] as Record<string, unknown>) : null;
  }

  async listMembers(communityId: number, limit: number, offset: number) {
    const { rows } = await pool.query(
      `SELECT cm.*, u.display_name, u.username, u.badge
       FROM community_members cm JOIN users u ON u.id = cm.user_id
       WHERE cm.community_id = $1 AND cm.status = 'ACTIVE'
       ORDER BY cm.role = 'LEADER' DESC, cm.role = 'MODERATOR' DESC, cm.joined_at
       LIMIT $2 OFFSET $3`,
      [communityId, limit, offset]
    );
    return (rows as Record<string, unknown>[]).map(r => ({
      ...toMember(r),
      displayName: r.display_name as string,
      username: (r.username as string) || null,
      badge: (r.badge as string) || null,
    }));
  }

  async listPendingMembers(communityId: number) {
    const { rows } = await pool.query(
      `SELECT cm.*, u.display_name, u.username
       FROM community_members cm JOIN users u ON u.id = cm.user_id
       WHERE cm.community_id = $1 AND cm.status = 'PENDING'
       ORDER BY cm.joined_at`,
      [communityId]
    );
    return (rows as Record<string, unknown>[]).map(r => ({
      ...toMember(r),
      displayName: r.display_name as string,
      username: (r.username as string) || null,
    }));
  }

  async updateMemberRole(communityId: number, userId: number, role: MemberRole): Promise<void> {
    await pool.query(
      'UPDATE community_members SET role = $1 WHERE community_id = $2 AND user_id = $3',
      [role, communityId, userId]
    );
  }

  async updateMemberStatus(communityId: number, userId: number, status: 'ACTIVE' | 'PENDING'): Promise<void> {
    await pool.query(
      'UPDATE community_members SET status = $1 WHERE community_id = $2 AND user_id = $3',
      [status, communityId, userId]
    );
    if (status === 'ACTIVE') {
      await pool.query('UPDATE communities SET member_count = member_count + 1 WHERE id = $1', [communityId]);
    }
  }

  async listCommunityPosts(communityId: number, limit: number, cursor?: string | null) {
    const cursorClause = cursor ? `AND p.created_at < $3` : '';
    const params: unknown[] = [communityId, limit];
    if (cursor) params.push(cursor);

    const { rows } = await pool.query(
      `SELECT p.id, p.author_id, p.title, p.body, p.created_at, p.type,
              u.display_name as author_name, u.badge as author_badge,
              COALESCE(v.cnt, 0)::int as vote_count,
              COALESCE(c.cnt, 0)::int as comment_count
       FROM posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN (SELECT target_id, COUNT(*) as cnt FROM votes WHERE target_type = 'POST' GROUP BY target_id) v ON v.target_id = p.id
       LEFT JOIN (SELECT post_id, COUNT(*) as cnt FROM comments GROUP BY post_id) c ON c.post_id = p.id
       WHERE p.community_id = $1 AND p.is_hidden = false ${cursorClause}
       ORDER BY p.created_at DESC
       LIMIT $2`,
      params
    );
    return (rows as Record<string, unknown>[]).map(r => ({
      id: Number(r.id),
      authorId: Number(r.author_id),
      title: r.title as string,
      body: r.body as string,
      createdAt: (r.created_at as Date).toISOString(),
      type: r.type as string,
      authorName: r.author_name as string,
      authorBadge: (r.author_badge as string) || null,
      voteCount: Number(r.vote_count),
      commentCount: Number(r.comment_count),
    }));
  }

  async listUserCommunityFeed(userId: number, limit: number, cursor?: string | null) {
    const cursorClause = cursor ? `AND p.created_at < $3` : '';
    const params: unknown[] = [userId, limit];
    if (cursor) params.push(cursor);

    const { rows } = await pool.query(
      `SELECT p.id, p.community_id, com.name as community_name, com.slug as community_slug,
              p.author_id, p.title, p.body, p.created_at, p.type,
              u.display_name as author_name, u.badge as author_badge,
              COALESCE(v.cnt, 0)::int as vote_count,
              COALESCE(c.cnt, 0)::int as comment_count
       FROM posts p
       JOIN communities com ON com.id = p.community_id
       JOIN community_members cm ON cm.community_id = p.community_id AND cm.user_id = $1 AND cm.status = 'ACTIVE'
       JOIN users u ON u.id = p.author_id
       LEFT JOIN (SELECT target_id, COUNT(*) as cnt FROM votes WHERE target_type = 'POST' GROUP BY target_id) v ON v.target_id = p.id
       LEFT JOIN (SELECT post_id, COUNT(*) as cnt FROM comments GROUP BY post_id) c ON c.post_id = p.id
       WHERE p.community_id IS NOT NULL AND p.is_hidden = false ${cursorClause}
       ORDER BY p.created_at DESC
       LIMIT $2`,
      params
    );
    return (rows as Record<string, unknown>[]).map(r => ({
      id: Number(r.id),
      communityId: Number(r.community_id),
      communityName: r.community_name as string,
      communitySlug: r.community_slug as string,
      authorId: Number(r.author_id),
      title: r.title as string,
      body: r.body as string,
      createdAt: (r.created_at as Date).toISOString(),
      type: r.type as string,
      authorName: r.author_name as string,
      authorBadge: (r.author_badge as string) || null,
      voteCount: Number(r.vote_count),
      commentCount: Number(r.comment_count),
    }));
  }

  async createEvent(input: CreateEventInput): Promise<CommunityEvent> {
    const { rows } = await pool.query(
      `INSERT INTO community_events (community_id, creator_id, title, description, location, event_date, event_end_date, is_online, max_attendees)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [input.communityId, input.creatorId, input.title, input.description || null, input.location || null, input.eventDate, input.eventEndDate || null, input.isOnline, input.maxAttendees || 0]
    );
    return toEvent(rows[0] as Record<string, unknown>);
  }

  async getEvent(eventId: number): Promise<CommunityEvent | null> {
    const { rows } = await pool.query('SELECT * FROM community_events WHERE id = $1', [eventId]);
    return rows[0] ? toEvent(rows[0] as Record<string, unknown>) : null;
  }

  async listEvents(communityId: number, upcoming: boolean): Promise<CommunityEvent[]> {
    const op = upcoming ? '>=' : '<';
    const { rows } = await pool.query(
      `SELECT * FROM community_events WHERE community_id = $1 AND event_date ${op} NOW() ORDER BY event_date ${upcoming ? 'ASC' : 'DESC'} LIMIT 20`,
      [communityId]
    );
    return (rows as Record<string, unknown>[]).map(toEvent);
  }

  async upsertRsvp(eventId: number, userId: number, status: RsvpStatus): Promise<void> {
    await pool.query(
      `INSERT INTO event_rsvps (event_id, user_id, status)
       VALUES ($1,$2,$3)
       ON CONFLICT (event_id, user_id) DO UPDATE SET status = $3`,
      [eventId, userId, status]
    );
  }

  async listRsvps(eventId: number) {
    const { rows } = await pool.query(
      `SELECT r.*, u.display_name FROM event_rsvps r JOIN users u ON u.id = r.user_id WHERE r.event_id = $1 ORDER BY r.created_at`,
      [eventId]
    );
    return (rows as Record<string, unknown>[]).map(r => ({
      id: Number(r.id),
      eventId: Number(r.event_id),
      userId: Number(r.user_id),
      status: r.status as RsvpStatus,
      createdAt: (r.created_at as Date).toISOString(),
      displayName: r.display_name as string,
    }));
  }

  async getRsvpCount(eventId: number): Promise<number> {
    const { rows } = await pool.query(
      `SELECT COUNT(*) as count FROM event_rsvps WHERE event_id = $1 AND status = 'GOING'`,
      [eventId]
    );
    return Number((rows[0] as { count: string }).count);
  }
}
