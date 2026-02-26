import { describe, it, expect } from 'vitest';
import { getBadgeForReputation, BADGE_LABELS, REP_POINTS } from '@/src/domain/services/reputation';

describe('Reputation', () => {
  it('assigns correct badges for reputation levels', () => {
    expect(getBadgeForReputation(0)).toBe('newcomer');
    expect(getBadgeForReputation(9)).toBe('newcomer');
    expect(getBadgeForReputation(10)).toBe('contributor');
    expect(getBadgeForReputation(50)).toBe('active');
    expect(getBadgeForReputation(200)).toBe('expert');
    expect(getBadgeForReputation(500)).toBe('legend');
    expect(getBadgeForReputation(9999)).toBe('legend');
  });

  it('has labels for all badges', () => {
    expect(BADGE_LABELS.newcomer).toBe('Newcomer');
    expect(BADGE_LABELS.legend).toBe('Legend');
  });

  it('has point values', () => {
    expect(REP_POINTS.POST_UPVOTED).toBe(5);
    expect(REP_POINTS.ANSWER_ACCEPTED).toBe(15);
  });
});
