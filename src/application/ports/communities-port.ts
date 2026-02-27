import { Community, CommunityMember, CommunityEvent, EventRsvp, CommunityScope, CommunityPrivacy, MemberRole, RsvpStatus } from '@/src/domain/entities/community';

export type CreateCommunityInput = {
  name: string;
  slug: string;
  description?: string | null;
  scope: CommunityScope;
  regionId?: string | null;
  privacy: CommunityPrivacy;
  leaderId: number;
  kakaoLink?: string | null;
};

export type CreateEventInput = {
  communityId: number;
  creatorId: number;
  title: string;
  description?: string | null;
  location?: string | null;
  eventDate: string;
  eventEndDate?: string | null;
  isOnline: boolean;
  maxAttendees?: number;
};

export interface CommunitiesPort {
  // Community CRUD
  create(input: CreateCommunityInput): Promise<Community>;
  findBySlug(slug: string): Promise<Community | null>;
  findById(id: number): Promise<Community | null>;
  update(id: number, fields: Partial<Pick<Community, 'name' | 'description' | 'privacy' | 'kakaoLink'>>): Promise<void>;

  // Listing
  listPublic(limit: number, offset: number): Promise<Community[]>;
  listByRegion(regionId: string, limit: number, offset: number): Promise<Community[]>;
  listByUser(userId: number): Promise<Community[]>;
  listPopular(limit: number): Promise<Community[]>;
  searchByName(query: string, limit: number): Promise<Community[]>;
  countCreatedByUser(userId: number): Promise<number>;

  // Members
  addMember(communityId: number, userId: number, role: MemberRole, status: 'ACTIVE' | 'PENDING'): Promise<void>;
  removeMember(communityId: number, userId: number): Promise<void>;
  getMember(communityId: number, userId: number): Promise<CommunityMember | null>;
  listMembers(communityId: number, limit: number, offset: number): Promise<(CommunityMember & { displayName: string; username: string | null; badge: string | null })[]>;
  listPendingMembers(communityId: number): Promise<(CommunityMember & { displayName: string; username: string | null })[]>;
  updateMemberRole(communityId: number, userId: number, role: MemberRole): Promise<void>;
  updateMemberStatus(communityId: number, userId: number, status: 'ACTIVE' | 'PENDING'): Promise<void>;

  // Community posts
  listCommunityPosts(communityId: number, limit: number, cursor?: string | null): Promise<{ id: number; authorId: number; title: string; body: string; createdAt: string; type: string; authorName: string; authorBadge: string | null; voteCount: number; commentCount: number }[]>;
  listUserCommunityFeed(userId: number, limit: number, cursor?: string | null): Promise<{ id: number; communityId: number; communityName: string; communitySlug: string; authorId: number; title: string; body: string; createdAt: string; type: string; authorName: string; authorBadge: string | null; voteCount: number; commentCount: number }[]>;

  // Events
  createEvent(input: CreateEventInput): Promise<CommunityEvent>;
  getEvent(eventId: number): Promise<CommunityEvent | null>;
  listEvents(communityId: number, upcoming: boolean): Promise<CommunityEvent[]>;

  // RSVP
  upsertRsvp(eventId: number, userId: number, status: RsvpStatus): Promise<void>;
  listRsvps(eventId: number): Promise<(EventRsvp & { displayName: string })[]>;
  getRsvpCount(eventId: number): Promise<number>;
}
