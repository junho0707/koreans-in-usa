import { CreateTagInput, TagRepository } from '@/src/application/ports/tag-repository';
import { TopicTag } from '@/src/domain/entities/topic-tag';

export async function createTag(repo: TagRepository, input: CreateTagInput): Promise<TopicTag> {
  if (!input.slug.trim()) throw new Error('Tag slug is required');
  if (!input.name.trim()) throw new Error('Tag name is required');
  return repo.createTag(input);
}

export async function updateTag(
  repo: TagRepository,
  id: number,
  input: Partial<CreateTagInput>,
): Promise<TopicTag> {
  return repo.updateTag(id, input);
}

export async function deleteTag(repo: TagRepository, id: number): Promise<void> {
  return repo.deleteTag(id);
}
