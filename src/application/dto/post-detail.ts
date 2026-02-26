import { PostType, RegionId } from '@/src/domain/entities/post';
import { CommentNode } from '@/src/domain/entities/comment';

export type PostDetail = {
  id: number;
  authorId: number;
  authorDisplayName: string;
  type: PostType;
  title: string;
  body: string;
  scopeUsa: boolean;
  scopeRegion: boolean;
  regionId: RegionId | null;
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
  comments: CommentNode[];
};
