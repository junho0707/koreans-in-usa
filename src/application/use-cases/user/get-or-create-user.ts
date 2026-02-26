import { UserRepository } from '@/src/application/ports/user-repository';
import { User } from '@/src/domain/entities/user';

type AuthInfo = {
  supabaseUid: string;
  email: string | null;
  phone: string | null;
  username?: string;
};

export async function getOrCreateUser(
  repo: UserRepository,
  auth: AuthInfo,
): Promise<User> {
  const existing = await repo.findBySupabaseUid(auth.supabaseUid);
  if (existing) return existing;

  const displayName = auth.username
    ?? (auth.email ? auth.email.split('@')[0] : `user_${auth.supabaseUid.slice(0, 8)}`);

  return repo.createFromAuth({
    supabaseUid: auth.supabaseUid,
    email: auth.email,
    phone: auth.phone,
    displayName,
    username: auth.username,
  });
}
