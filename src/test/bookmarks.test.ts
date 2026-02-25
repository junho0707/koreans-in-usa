import { describe, it, expect } from 'vitest';
import type { BookmarkRepository, BookmarkedPost } from '@/src/application/ports/bookmark-repository';

class MockBookmarkRepository implements BookmarkRepository {
  private bookmarks: Map<string, { id: number; postId: number; createdAt: string }> = new Map();
  private nextId = 1;

  async toggle(userId: number, postId: number): Promise<{ bookmarked: boolean }> {
    const key = `${userId}:${postId}`;
    if (this.bookmarks.has(key)) {
      this.bookmarks.delete(key);
      return { bookmarked: false };
    }
    this.bookmarks.set(key, { id: this.nextId++, postId, createdAt: new Date().toISOString() });
    return { bookmarked: true };
  }

  async isBookmarked(userId: number, postId: number): Promise<boolean> {
    return this.bookmarks.has(`${userId}:${postId}`);
  }

  async getByUser(userId: number): Promise<{ items: BookmarkedPost[]; nextCursor: number | null }> {
    const items: BookmarkedPost[] = [];
    for (const [key, val] of this.bookmarks) {
      if (key.startsWith(`${userId}:`)) {
        items.push({
          id: val.id,
          postId: val.postId,
          title: `Post ${val.postId}`,
          type: 'GENERAL',
          authorDisplayName: 'Author',
          score: 0,
          commentCount: 0,
          createdAt: val.createdAt,
          bookmarkedAt: val.createdAt,
        });
      }
    }
    return { items, nextCursor: null };
  }
}

describe('Bookmarks', () => {
  it('toggles bookmark on', async () => {
    const repo = new MockBookmarkRepository();
    const result = await repo.toggle(1, 10);
    expect(result.bookmarked).toBe(true);
    expect(await repo.isBookmarked(1, 10)).toBe(true);
  });

  it('toggles bookmark off', async () => {
    const repo = new MockBookmarkRepository();
    await repo.toggle(1, 10);
    const result = await repo.toggle(1, 10);
    expect(result.bookmarked).toBe(false);
    expect(await repo.isBookmarked(1, 10)).toBe(false);
  });

  it('returns user bookmarks', async () => {
    const repo = new MockBookmarkRepository();
    await repo.toggle(1, 10);
    await repo.toggle(1, 20);
    await repo.toggle(2, 30); // different user

    const { items } = await repo.getByUser(1);
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.postId).sort()).toEqual([10, 20]);
  });

  it('isBookmarked returns false for non-bookmarked', async () => {
    const repo = new MockBookmarkRepository();
    expect(await repo.isBookmarked(1, 999)).toBe(false);
  });
});
