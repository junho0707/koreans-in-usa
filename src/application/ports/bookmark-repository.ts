export type BookmarkedPost = {
  id: number;
  postId: number;
  title: string;
  type: string;
  authorDisplayName: string;
  score: number;
  commentCount: number;
  createdAt: string;
  bookmarkedAt: string;
};

export interface BookmarkRepository {
  toggle(userId: number, postId: number): Promise<{ bookmarked: boolean }>;
  isBookmarked(userId: number, postId: number): Promise<boolean>;
  getByUser(userId: number, cursor?: number, limit?: number): Promise<{ items: BookmarkedPost[]; nextCursor: number | null }>;
}
