import { TopicTag } from '@/src/domain/entities/topic-tag';

export type CreateTagInput = {
  slug: string;
  name: string;
  keywords: string[];
};

export interface TagRepository {
  getAllTags(): Promise<TopicTag[]>;
  setPostTags(postId: number, tagIds: number[], source: 'USER' | 'AUTO'): Promise<void>;
  getTagsByPostId(postId: number): Promise<TopicTag[]>;
  createTag(input: CreateTagInput): Promise<TopicTag>;
  updateTag(id: number, input: Partial<CreateTagInput>): Promise<TopicTag>;
  deleteTag(id: number): Promise<void>;
}
