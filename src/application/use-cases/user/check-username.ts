import { UserRepository } from '@/src/application/ports/user-repository';

const RESERVED_NAMES = new Set([
  'admin', 'administrator', 'root', 'system', 'mod', 'moderator',
  'support', 'help', 'staff', 'official', 'null', 'undefined',
  'api', 'www', 'mail', 'ftp', 'login', 'signup', 'settings',
]);

const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,19}$/;

export type CheckUsernameResult = {
  available: boolean;
  reason?: string;
};

export async function checkUsername(
  repo: UserRepository,
  username: string,
): Promise<CheckUsernameResult> {
  const lower = username.toLowerCase();

  if (!USERNAME_REGEX.test(lower)) {
    return {
      available: false,
      reason: 'Username must be 3-20 characters, start with a letter, and contain only lowercase letters, numbers, and underscores',
    };
  }

  if (RESERVED_NAMES.has(lower)) {
    return { available: false, reason: 'This username is reserved' };
  }

  const taken = await repo.isUsernameTaken(lower);
  if (taken) {
    return { available: false, reason: 'This username is already taken' };
  }

  return { available: true };
}
