import { PostDetail } from '@/src/application/dto/post-detail';
import { PostRepository } from '@/src/application/ports/post-repository';
import { PostType, RegionId } from '@/src/domain/entities/post';
import { buildCommentTree } from '@/src/application/use-cases/post/get-comments-threaded';

export async function getPostDetail(
  repo: PostRepository,
  postId: number,
  viewerUserId: number | null,
  commentSort: 'best' | 'new' = 'best',
): Promise<PostDetail | null> {
  const post = await repo.getPostById(postId, viewerUserId);
  if (!post) return null;

  const flatComments = await repo.getCommentsByPostId(postId);
  const comments = buildCommentTree(flatComments, commentSort);

  return {
    ...post,
    type: post.type as PostType,
    regionId: post.regionId as RegionId | null,
    comments,
  };
}
