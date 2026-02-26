import { getOrCreateUser } from '@/src/application/use-cases/user/get-or-create-user';
import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

const userRepo = new PgUserRepository();

export async function requireUserId(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const appUser = await getOrCreateUser(userRepo, {
    supabaseUid: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    username: user.user_metadata?.username,
  });

  return appUser.id;
}
