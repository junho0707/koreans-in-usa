import { describe, expect, it } from 'vitest';
import { getOrCreateUser } from '@/src/application/use-cases/user/get-or-create-user';
import { updateProfile } from '@/src/application/use-cases/user/update-profile';
import { UserRepository } from '@/src/application/ports/user-repository';
import { User } from '@/src/domain/entities/user';

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    supabaseUid: 'uid-123',
    email: 'test@example.com',
    phone: null,
    username: null,
    displayName: 'test',
    profileState: null,
    country: null,
    city: null,
    interests: [],
    koreanXIdentity: null,
    role: 'USER',
    isActive: true,
    reputation: 0,
    badge: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createMockRepo(existingUser?: User): UserRepository {
  let stored = existingUser ?? null;
  return {
    async findBySupabaseUid(uid: string) {
      return stored?.supabaseUid === uid ? stored : null;
    },
    async findById(id: number) {
      return stored?.id === id ? stored : null;
    },
    async findByUsername(username: string) {
      return stored?.username?.toLowerCase() === username.toLowerCase() ? stored : null;
    },
    async findByEmail(email: string) {
      return stored?.email?.toLowerCase() === email.toLowerCase() ? stored : null;
    },
    async isUsernameTaken(username: string) {
      return stored?.username?.toLowerCase() === username.toLowerCase();
    },
    async createFromAuth(input) {
      stored = createMockUser({
        supabaseUid: input.supabaseUid,
        email: input.email,
        phone: input.phone,
        displayName: input.displayName,
        username: input.username ?? null,
      });
      return stored;
    },
    async updateProfile(id, input) {
      if (!stored || stored.id !== id) throw new Error('User not found');
      stored = { ...stored, ...input } as User;
      return stored;
    },
  };
}

describe('get-or-create-user', () => {
  it('returns existing user when found by supabase uid', async () => {
    const existing = createMockUser();
    const repo = createMockRepo(existing);
    const user = await getOrCreateUser(repo, {
      supabaseUid: 'uid-123',
      email: 'test@example.com',
      phone: null,
    });
    expect(user.id).toBe(1);
    expect(user.displayName).toBe('test');
  });

  it('creates new user with email-derived display name', async () => {
    const repo = createMockRepo();
    const user = await getOrCreateUser(repo, {
      supabaseUid: 'uid-new',
      email: 'alice@example.com',
      phone: null,
    });
    expect(user.displayName).toBe('alice');
    expect(user.supabaseUid).toBe('uid-new');
  });

  it('creates new user with username as display name when provided', async () => {
    const repo = createMockRepo();
    const user = await getOrCreateUser(repo, {
      supabaseUid: 'uid-new',
      email: 'alice@example.com',
      phone: null,
      username: 'alice_k',
    });
    expect(user.displayName).toBe('alice_k');
    expect(user.username).toBe('alice_k');
  });

  it('falls back to uid-derived name when no email or username', async () => {
    const repo = createMockRepo();
    const user = await getOrCreateUser(repo, {
      supabaseUid: 'uid-abcdef12',
      email: null,
      phone: null,
    });
    expect(user.displayName).toBe('user_uid-abcd');
  });
});

describe('update-profile', () => {
  it('updates display name', async () => {
    const existing = createMockUser();
    const repo = createMockRepo(existing);
    const updated = await updateProfile(repo, 1, { displayName: 'newname' });
    expect(updated.displayName).toBe('newname');
  });

  it('rejects empty display name', async () => {
    const existing = createMockUser();
    const repo = createMockRepo(existing);
    try {
      await updateProfile(repo, 1, { displayName: '  ' });
      expect(false).toBe(true);
    } catch (e) {
      expect((e as Error).message).toBe('Display name cannot be empty');
    }
  });

  it('rejects more than 20 interests', async () => {
    const existing = createMockUser();
    const repo = createMockRepo(existing);
    const tooMany = Array.from({ length: 21 }, (_, i) => `interest-${i}`);
    try {
      await updateProfile(repo, 1, { interests: tooMany });
      expect(false).toBe(true);
    } catch (e) {
      expect((e as Error).message).toBe('Maximum 20 interests allowed');
    }
  });
});
