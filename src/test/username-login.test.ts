import { describe, expect, it } from 'vitest';
import { resolveLoginIdentifier } from '@/src/application/use-cases/user/resolve-login-identifier';
import { checkUsername } from '@/src/application/use-cases/user/check-username';
import { UserRepository } from '@/src/application/ports/user-repository';
import { User } from '@/src/domain/entities/user';

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    supabaseUid: 'uid-123',
    email: 'alice@example.com',
    phone: null,
    username: 'alice_k',
    displayName: 'alice_k',
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
  const stored = existingUser ?? null;
  return {
    async findBySupabaseUid() { return null; },
    async findById() { return null; },
    async findByUsername(username: string) {
      return stored?.username?.toLowerCase() === username.toLowerCase() ? stored : null;
    },
    async findByEmail(email: string) {
      return stored?.email?.toLowerCase() === email.toLowerCase() ? stored : null;
    },
    async isUsernameTaken(username: string) {
      return stored?.username?.toLowerCase() === username.toLowerCase();
    },
    async createFromAuth() { return createMockUser(); },
    async updateProfile() { return createMockUser(); },
  };
}

describe('resolveLoginIdentifier', () => {
  it('returns email directly if identifier contains @', async () => {
    const repo = createMockRepo();
    const email = await resolveLoginIdentifier(repo, 'test@example.com');
    expect(email).toBe('test@example.com');
  });

  it('resolves username to email', async () => {
    const repo = createMockRepo(createMockUser());
    const email = await resolveLoginIdentifier(repo, 'alice_k');
    expect(email).toBe('alice@example.com');
  });

  it('returns null for unknown username', async () => {
    const repo = createMockRepo();
    const email = await resolveLoginIdentifier(repo, 'unknown_user');
    expect(email).toBeNull();
  });

  it('returns null for empty identifier', async () => {
    const repo = createMockRepo();
    const email = await resolveLoginIdentifier(repo, '  ');
    expect(email).toBeNull();
  });
});

describe('checkUsername', () => {
  it('accepts valid username', async () => {
    const repo = createMockRepo();
    const result = await checkUsername(repo, 'good_name');
    expect(result.available).toBe(true);
  });

  it('rejects too short username', async () => {
    const repo = createMockRepo();
    const result = await checkUsername(repo, 'ab');
    expect(result.available).toBe(false);
    expect(result.reason).toContain('3-20 characters');
  });

  it('rejects username starting with number', async () => {
    const repo = createMockRepo();
    const result = await checkUsername(repo, '1bad');
    expect(result.available).toBe(false);
  });

  it('rejects reserved names', async () => {
    const repo = createMockRepo();
    const result = await checkUsername(repo, 'admin');
    expect(result.available).toBe(false);
    expect(result.reason).toBe('This username is reserved');
  });

  it('rejects taken username', async () => {
    const repo = createMockRepo(createMockUser());
    const result = await checkUsername(repo, 'alice_k');
    expect(result.available).toBe(false);
    expect(result.reason).toBe('This username is already taken');
  });

  it('accepts mixed case by lowercasing', async () => {
    const repo = createMockRepo();
    const result = await checkUsername(repo, 'goodname');
    expect(result.available).toBe(true);
  });
});
