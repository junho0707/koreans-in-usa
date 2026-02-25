import { describe, expect, it } from 'vitest';
import { buildUsaCandidatePool } from '@/src/domain/services/usa-feed-policy';
import { isAfterCursor } from '@/src/domain/value-objects/feed-cursor';

describe('domain: USA feed policy', () => {
  it('includes scope_usa and top 3 regional posts per region within 12h', () => {
    const now = '2026-01-01T12:00:00.000Z';
    const posts = [
      { id: 1, authorId: 1, type: 'GENERAL', title: 'a', body: 'a', scopeUsa: true, scopeRegion: false, regionId: null, stateCode: null, metroArea: null, createdAt: '2026-01-01T11:00:00.000Z', score: 1 },
      { id: 2, authorId: 1, type: 'GENERAL', title: 'b', body: 'b', scopeUsa: false, scopeRegion: true, regionId: 'NE', stateCode: null, metroArea: null, createdAt: '2026-01-01T10:00:00.000Z', score: 12 },
      { id: 3, authorId: 1, type: 'GENERAL', title: 'c', body: 'c', scopeUsa: false, scopeRegion: true, regionId: 'NE', stateCode: null, metroArea: null, createdAt: '2026-01-01T09:00:00.000Z', score: 11 },
      { id: 4, authorId: 1, type: 'GENERAL', title: 'd', body: 'd', scopeUsa: false, scopeRegion: true, regionId: 'NE', stateCode: null, metroArea: null, createdAt: '2026-01-01T08:00:00.000Z', score: 10 },
      { id: 5, authorId: 1, type: 'GENERAL', title: 'e', body: 'e', scopeUsa: false, scopeRegion: true, regionId: 'NE', stateCode: null, metroArea: null, createdAt: '2026-01-01T07:00:00.000Z', score: 9 },
      { id: 6, authorId: 1, type: 'GENERAL', title: 'f', body: 'f', scopeUsa: false, scopeRegion: true, regionId: 'S', stateCode: null, metroArea: null, createdAt: '2026-01-01T11:30:00.000Z', score: 8 },
      { id: 7, authorId: 1, type: 'GENERAL', title: 'g', body: 'g', scopeUsa: false, scopeRegion: true, regionId: 'S', stateCode: null, metroArea: null, createdAt: '2026-01-01T11:00:00.000Z', score: 7 },
      { id: 8, authorId: 1, type: 'GENERAL', title: 'h', body: 'h', scopeUsa: false, scopeRegion: true, regionId: 'S', stateCode: null, metroArea: null, createdAt: '2026-01-01T10:30:00.000Z', score: 6 },
      { id: 9, authorId: 1, type: 'GENERAL', title: 'i', body: 'i', scopeUsa: false, scopeRegion: true, regionId: 'S', stateCode: null, metroArea: null, createdAt: '2026-01-01T10:00:00.000Z', score: 5 },
      { id: 10, authorId: 1, type: 'GENERAL', title: 'j', body: 'j', scopeUsa: true, scopeRegion: false, regionId: null, stateCode: null, metroArea: null, createdAt: '2025-12-31T00:00:00.000Z', score: 99 },
    ] as const;

    const result = buildUsaCandidatePool([...posts], now).map((p) => p.id);

    expect(result).toContain(1);
    expect(result).toEqual(expect.arrayContaining([2, 3, 4, 6, 7, 8]));
    expect(result).not.toContain(5);
    expect(result).not.toContain(9);
    expect(result).not.toContain(10);
  });

  it('keeps tuple ordering stable across cursor pages with no duplicates', () => {
    const posts = [
      { id: 5, authorId: 1, type: 'GENERAL', title: '5', body: '5', scopeUsa: true, scopeRegion: false, regionId: null, stateCode: null, metroArea: null, createdAt: '2026-01-01T10:00:00.000Z', score: 9 },
      { id: 4, authorId: 1, type: 'GENERAL', title: '4', body: '4', scopeUsa: true, scopeRegion: false, regionId: null, stateCode: null, metroArea: null, createdAt: '2026-01-01T10:00:00.000Z', score: 9 },
      { id: 3, authorId: 1, type: 'GENERAL', title: '3', body: '3', scopeUsa: true, scopeRegion: false, regionId: null, stateCode: null, metroArea: null, createdAt: '2026-01-01T09:00:00.000Z', score: 8 },
      { id: 2, authorId: 1, type: 'GENERAL', title: '2', body: '2', scopeUsa: true, scopeRegion: false, regionId: null, stateCode: null, metroArea: null, createdAt: '2026-01-01T08:00:00.000Z', score: 7 },
      { id: 1, authorId: 1, type: 'GENERAL', title: '1', body: '1', scopeUsa: true, scopeRegion: false, regionId: null, stateCode: null, metroArea: null, createdAt: '2026-01-01T07:00:00.000Z', score: 6 },
    ] as const;

    const page1 = posts.slice(0, 2);
    const cursor = { score: page1[1].score, createdAt: page1[1].createdAt, id: page1[1].id };
    const page2 = posts.filter((p) => isAfterCursor(p, cursor)).slice(0, 2);

    const combined = [...page1, ...page2].map((p) => p.id);
    expect(new Set(combined).size).toBe(combined.length);
    expect(combined).toEqual([5, 4, 3, 2]);
  });
});
