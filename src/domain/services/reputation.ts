export type Badge = 'newcomer' | 'contributor' | 'active' | 'expert' | 'leader';

// Level thresholds — XP required for each level
const BADGE_THRESHOLDS: { min: number; badge: Badge }[] = [
  { min: 500, badge: 'leader' },
  { min: 200, badge: 'expert' },
  { min: 50, badge: 'active' },
  { min: 10, badge: 'contributor' },
  { min: 0, badge: 'newcomer' },
];

export function getBadgeForReputation(reputation: number): Badge {
  for (const { min, badge } of BADGE_THRESHOLDS) {
    if (reputation >= min) return badge;
  }
  return 'newcomer';
}

export const BADGE_LABELS: Record<Badge, string> = {
  newcomer: 'Newcomer',
  contributor: 'Contributor',
  active: 'Active Member',
  expert: 'Expert',
  leader: 'Leader',
};

// Level numbers for display
export const BADGE_LEVELS: Record<Badge, number> = {
  newcomer: 1,
  contributor: 2,
  active: 3,
  expert: 4,
  leader: 5,
};

// XP thresholds for next level (used for progress bars)
export const NEXT_LEVEL_XP: Record<Badge, number | null> = {
  newcomer: 10,
  contributor: 50,
  active: 200,
  expert: 500,
  leader: null, // max level
};

// Minimum XP required to create a community
export const COMMUNITY_CREATE_MIN_XP = 500;

// XP point values
export const REP_POINTS = {
  POST_UPVOTED: 10,
  COMMENT_UPVOTED: 2,
  ANSWER_ACCEPTED: 15,
  POST_CREATED: 1,
} as const;
