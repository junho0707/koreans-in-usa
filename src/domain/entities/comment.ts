export type Comment = {
  id: number;
  postId: number;
  authorId: number;
  authorDisplayName: string;
  parentCommentId: number | null;
  body: string;
  score: number;
  createdAt: string;
};

export type CommentNode = Comment & {
  replies: CommentNode[];
};
