export type Badge = 'newcomer' | 'contributor' | 'active' | 'expert' | 'legend';

const BADGE_THRESHOLDS: { min: number; badge: Badge }[] = [
  { min: 500, badge: 'legend' },
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
  legend: 'Legend',
};

// Reputation point values
export const REP_POINTS = {
  POST_UPVOTED: 5,
  COMMENT_UPVOTED: 2,
  ANSWER_ACCEPTED: 15,
  POST_CREATED: 1,
} as const;
