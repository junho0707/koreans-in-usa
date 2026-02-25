import { TagRepository } from '@/src/application/ports/tag-repository';
import { autoTag } from '@/src/domain/services/auto-tagger';

export async function autoTagPost(
  repo: TagRepository,
  postId: number,
  title: string,
  body: string,
): Promise<void> {
  const allTags = await repo.getAllTags();
  const tagIds = autoTag(title, body, allTags);

  if (tagIds.length > 0) {
    await repo.setPostTags(postId, tagIds, 'AUTO');
  }
}
