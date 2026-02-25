import { PostType, RegionId } from '@/src/domain/entities/post';

export type CreatePostCommand = {
  authorId: number;
  type: PostType;
  title: string;
  body: string;
  scopeUsa: boolean;
  scopeRegion: boolean;
  regionId?: RegionId | null;
  stateCode?: string | null;
  metroArea?: string | null;
};

export type CreateCommentCommand = {
  authorId: number;
  postId: number;
  parentCommentId?: number | null;
  body: string;
};

export type ToggleVoteCommand = {
  userId: number;
  targetType: 'POST' | 'COMMENT';
  targetId: number;
};

export interface CommunityRepository {
  createPost(command: CreatePostCommand): Promise<{ id: number }>;
  createComment(command: CreateCommentCommand): Promise<{ id: number }>;
  toggleVote(command: ToggleVoteCommand): Promise<{ active: boolean }>;
}
