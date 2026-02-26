import { describe, it, expect } from 'vitest';
import type { FollowRepository, FollowCounts } from '@/src/application/ports/follow-repository';

class MockFollowRepository implements FollowRepository {
  private follows: Map<string, { id: number; createdAt: string }> = new Map();
  private nextId = 1;

  async toggle(followerId: number, followingId: number) {
    if (followerId === followingId) throw new Error('Cannot follow yourself');
    const key = `${followerId}:${followingId}`;
    if (this.follows.has(key)) {
      this.follows.delete(key);
      return { following: false };
    }
    this.follows.set(key, { id: this.nextId++, createdAt: new Date().toISOString() });
    return { following: true };
  }

  async isFollowing(followerId: number, followingId: number) {
    return this.follows.has(`${followerId}:${followingId}`);
  }

  async getCounts(userId: number): Promise<FollowCounts> {
    let followers = 0;
    let following = 0;
    for (const key of this.follows.keys()) {
      const [f, t] = key.split(':').map(Number);
      if (t === userId) followers++;
      if (f === userId) following++;
    }
    return { followers, following };
  }

  async getFollowers() { return { items: [], nextCursor: null }; }
  async getFollowing() { return { items: [], nextCursor: null }; }
}

describe('Follows', () => {
  it('follows and unfollows', async () => {
    const repo = new MockFollowRepository();
    const r1 = await repo.toggle(1, 2);
    expect(r1.following).toBe(true);
    expect(await repo.isFollowing(1, 2)).toBe(true);

    const r2 = await repo.toggle(1, 2);
    expect(r2.following).toBe(false);
    expect(await repo.isFollowing(1, 2)).toBe(false);
  });

  it('cannot follow yourself', async () => {
    const repo = new MockFollowRepository();
    await expect(repo.toggle(1, 1)).rejects.toThrow('Cannot follow yourself');
  });

  it('counts followers and following', async () => {
    const repo = new MockFollowRepository();
    await repo.toggle(1, 2);
    await repo.toggle(3, 2);
    await repo.toggle(1, 4);

    const counts = await repo.getCounts(2);
    expect(counts.followers).toBe(2);
    expect(counts.following).toBe(0);

    const counts1 = await repo.getCounts(1);
    expect(counts1.following).toBe(2);
    expect(counts1.followers).toBe(0);
  });
});
