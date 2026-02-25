import { CommunityRepository, CreatePostCommand } from '@/src/application/ports/community-repository';

export async function createPost(repo: CommunityRepository, command: CreatePostCommand) {
  if (!command.scopeUsa && !command.scopeRegion) {
    throw new Error('Post must target at least one scope');
  }

  if (command.scopeRegion && !command.regionId) {
    throw new Error('regionId is required when scopeRegion is true');
  }

  return repo.createPost(command);
}
