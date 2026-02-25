import { describe, it, expect } from 'vitest';
import type { SearchFilters, SearchResult, SearchRepository } from '@/src/application/ports/search-repository';

// Mock search repo for unit testing
class MockSearchRepository implements SearchRepository {
  private posts = [
    { id: 1, title: 'How to get a visa', body: 'Guide to US visa process for Koreans', type: 'TIP', authorId: 1, authorDisplayName: 'Alice', regionId: null, score: 5, commentCount: 2, tags: ['immigration'], createdAt: '2025-01-01' },
    { id: 2, title: 'Best Korean restaurants', body: 'List of top Korean restaurants in NYC', type: 'GENERAL', authorId: 2, authorDisplayName: 'Bob', regionId: 'NE', score: 3, commentCount: 1, tags: ['food'], createdAt: '2025-01-02' },
    { id: 3, title: 'Tax tips for immigrants', body: 'How to file taxes as a Korean in USA', type: 'TIP', authorId: 1, authorDisplayName: 'Alice', regionId: null, score: 8, commentCount: 4, tags: ['finance'], createdAt: '2025-01-03' },
  ];

  async search(filters: SearchFilters): Promise<SearchResult> {
    const q = filters.query.toLowerCase();
    let results = this.posts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q),
    );

    if (filters.type) {
      results = results.filter((p) => p.type === filters.type);
    }
    if (filters.region) {
      results = results.filter((p) => p.regionId === filters.region);
    }

    const limit = filters.limit ?? 20;
    const items = results.slice(0, limit).map((p) => ({
      ...p,
      bodySnippet: p.body.slice(0, 200),
    }));

    return { items, nextCursor: null, total: results.length };
  }
}

describe('Search', () => {
  const repo = new MockSearchRepository();

  it('returns matching posts by query', async () => {
    const result = await repo.search({ query: 'visa' });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('How to get a visa');
  });

  it('returns multiple results for broad query', async () => {
    const result = await repo.search({ query: 'korean' });
    expect(result.items.length).toBeGreaterThanOrEqual(2);
  });

  it('filters by type', async () => {
    const result = await repo.search({ query: 'korean', type: 'TIP' });
    expect(result.items.every((i) => i.type === 'TIP')).toBe(true);
  });

  it('returns empty for no matches', async () => {
    const result = await repo.search({ query: 'xyznonexistent' });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
