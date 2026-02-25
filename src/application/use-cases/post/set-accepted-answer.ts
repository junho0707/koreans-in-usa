import { CommunityRepository } from '@/src/application/ports/community-repository';

export async function setAcceptedAnswer(
  repo: CommunityRepository,
  postId: number,
  commentId: number | null,
  requesterId: number,
): Promise<void> {
  const authorId = await repo.getPostAuthorId(postId);
  if (!authorId) throw new Error('Post not found');
  if (authorId !== requesterId) throw new Error('Only the post author can accept an answer');

  const postType = await repo.getPostType(postId);
  if (postType !== 'QA') throw new Error('Only QA posts can have accepted answers');

  await repo.setAcceptedAnswer(postId, commentId);
}
