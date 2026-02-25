import { UpdateProfileInput, UserRepository } from '@/src/application/ports/user-repository';
import { User } from '@/src/domain/entities/user';

export async function updateProfile(
  repo: UserRepository,
  userId: number,
  input: UpdateProfileInput,
): Promise<User> {
  if (input.displayName !== undefined && !input.displayName.trim()) {
    throw new Error('Display name cannot be empty');
  }

  if (input.interests && input.interests.length > 20) {
    throw new Error('Maximum 20 interests allowed');
  }

  return repo.updateProfile(userId, input);
}
