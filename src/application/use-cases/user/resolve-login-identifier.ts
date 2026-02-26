import { UserRepository } from '@/src/application/ports/user-repository';

export async function resolveLoginIdentifier(
  repo: UserRepository,
  identifier: string,
): Promise<string | null> {
  const trimmed = identifier.trim().toLowerCase();
  if (!trimmed) return null;

  // If it looks like an email, return it directly
  if (trimmed.includes('@')) {
    return trimmed;
  }

  // Otherwise treat as username and resolve to email
  const user = await repo.findByUsername(trimmed);
  return user?.email ?? null;
}
