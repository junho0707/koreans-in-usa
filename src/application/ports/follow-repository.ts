export type FollowCounts = {
  followers: number;
  following: number;
};

export interface FollowRepository {
  toggle(followerId: number, followingId: number): Promise<{ following: boolean }>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  getCounts(userId: number): Promise<FollowCounts>;
  getFollowers(userId: number, cursor?: number, limit?: number): Promise<{ items: { id: number; displayName: string; createdAt: string }[]; nextCursor: number | null }>;
  getFollowing(userId: number, cursor?: number, limit?: number): Promise<{ items: { id: number; displayName: string; createdAt: string }[]; nextCursor: number | null }>;
}
