export type CommunityScope = 'USA' | 'REGION';
export type CommunityPrivacy = 'PUBLIC' | 'PRIVATE';
export type MemberRole = 'LEADER' | 'MODERATOR' | 'MEMBER';
export type MemberStatus = 'ACTIVE' | 'PENDING';
export type RsvpStatus = 'GOING' | 'MAYBE' | 'NOT_GOING';

export type Community = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  scope: CommunityScope;
  regionId: string | null;
  privacy: CommunityPrivacy;
  leaderId: number;
  kakaoLink: string | null;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
};

export type CommunityMember = {
  id: number;
  communityId: number;
  userId: number;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
};

export type CommunityEvent = {
  id: number;
  communityId: number;
  creatorId: number;
  title: string;
  description: string | null;
  location: string | null;
  eventDate: string;
  eventEndDate: string | null;
  isOnline: boolean;
  maxAttendees: number;
  createdAt: string;
};

export type EventRsvp = {
  id: number;
  eventId: number;
  userId: number;
  status: RsvpStatus;
  createdAt: string;
};
