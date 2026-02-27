import { describe, it, expect } from 'vitest';
import { getBadgeForReputation, BADGE_LABELS, REP_POINTS, BADGE_LEVELS, COMMUNITY_CREATE_MIN_XP } from '@/src/domain/services/reputation';

describe('Reputation', () => {
  it('assigns correct badges for reputation levels', () => {
    expect(getBadgeForReputation(0)).toBe('newcomer');
    expect(getBadgeForReputation(9)).toBe('newcomer');
    expect(getBadgeForReputation(10)).toBe('contributor');
    expect(getBadgeForReputation(50)).toBe('active');
    expect(getBadgeForReputation(200)).toBe('expert');
    expect(getBadgeForReputation(500)).toBe('leader');
    expect(getBadgeForReputation(9999)).toBe('leader');
  });

  it('has labels for all badges', () => {
    expect(BADGE_LABELS.newcomer).toBe('Newcomer');
    expect(BADGE_LABELS.leader).toBe('Leader');
  });

  it('has point values', () => {
    expect(REP_POINTS.POST_UPVOTED).toBe(10);
    expect(REP_POINTS.ANSWER_ACCEPTED).toBe(15);
  });

  it('has level numbers', () => {
    expect(BADGE_LEVELS.newcomer).toBe(1);
    expect(BADGE_LEVELS.leader).toBe(5);
  });

  it('requires 500 XP to create a community', () => {
    expect(COMMUNITY_CREATE_MIN_XP).toBe(500);
  });
});
