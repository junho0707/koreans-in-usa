import { describe, it, expect, vi, afterEach } from 'vitest';
import { relativeTime } from '@/src/lib/relative-time';

describe('relativeTime', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "just now" for dates less than 60 seconds ago', () => {
    const now = new Date();
    expect(relativeTime(now.toISOString())).toBe('just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(relativeTime(fiveMinAgo.toISOString())).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000);
    expect(relativeTime(threeHoursAgo.toISOString())).toBe('3h ago');
  });

  it('returns days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000);
    expect(relativeTime(twoDaysAgo.toISOString())).toBe('2d ago');
  });

  it('returns weeks ago', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400 * 1000);
    expect(relativeTime(twoWeeksAgo.toISOString())).toBe('2w ago');
  });
});
