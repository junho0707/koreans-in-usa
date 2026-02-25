import { CommunityRepository, CreateCommentCommand } from '@/src/application/ports/community-repository';

export async function createComment(repo: CommunityRepository, command: CreateCommentCommand) {
  if (!command.body?.trim()) {
    throw new Error('Comment body is required');
  }

  return repo.createComment(command);
}
