import { CommunityRepository, CreatePostCommand } from '@/src/application/ports/community-repository';

export async function createPost(repo: CommunityRepository, command: CreatePostCommand) {
  // GENERAL posts can only be created inside a community
  if (command.type === 'GENERAL' && !command.communityId) {
    throw new Error('General posts can only be created inside a community');
  }

  // Community posts don't need scope
  if (command.communityId) {
    return repo.createPost({ ...command, scopeUsa: false, scopeRegion: false });
  }

  if (!command.scopeUsa && !command.scopeRegion) {
    throw new Error('Post must target at least one scope');
  }

  if (command.scopeRegion && !command.regionId) {
    throw new Error('regionId is required when scopeRegion is true');
  }

  return repo.createPost(command);
}
