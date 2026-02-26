import { Comment } from '@/src/domain/entities/comment';

export type PostDetailRow = {
  id: number;
  authorId: number;
  authorDisplayName: string;
  type: string;
  title: string;
  body: string;
  scopeUsa: boolean;
  scopeRegion: boolean;
  regionId: string | null;
  stateCode: string | null;
  metroArea: string | null;
  score: number;
  commentCount: number;
  acceptedCommentId: number | null;
  tags: string[];
  viewerVoted: boolean;
  viewCount: number;
  imageUrl: string | null;
  createdAt: string;
};

export interface PostRepository {
  getPostById(postId: number, viewerUserId: number | null): Promise<PostDetailRow | null>;
  getCommentsByPostId(postId: number): Promise<Comment[]>;
}
