import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { getOrCreateUser } from '@/src/application/use-cases/user/get-or-create-user';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgUserRepository();

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user has a username set
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const username = supabaseUser.user_metadata?.username
          ?? supabaseUser.user_metadata?.preferred_username
          ?? null;
        const appUser = await getOrCreateUser(repo, {
          supabaseUid: supabaseUser.id,
          email: supabaseUser.email ?? null,
          phone: supabaseUser.phone ?? null,
          username,
        });

        if (!appUser.username) {
          return NextResponse.redirect(`${origin}/login/complete-profile`);
        }
      }

      return NextResponse.redirect(origin);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
