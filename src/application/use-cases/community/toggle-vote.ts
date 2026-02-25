import { CommunityRepository, ToggleVoteCommand } from '@/src/application/ports/community-repository';

export async function toggleVote(repo: CommunityRepository, command: ToggleVoteCommand) {
  if (command.targetType !== 'POST' && command.targetType !== 'COMMENT') {
    throw new Error('Invalid target type');
  }

  return repo.toggleVote(command);
}
