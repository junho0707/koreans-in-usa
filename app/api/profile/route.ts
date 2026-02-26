import { getOrCreateUser } from '@/src/application/use-cases/user/get-or-create-user';
import { updateProfile } from '@/src/application/use-cases/user/update-profile';
import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgUserRepository();

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return unauthorized('Not authenticated');
  }

  const user = await getOrCreateUser(repo, {
    supabaseUid: supabaseUser.id,
    email: supabaseUser.email ?? null,
    phone: supabaseUser.phone ?? null,
    username: supabaseUser.user_metadata?.username,
  });

  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return unauthorized('Not authenticated');
  }

  const appUser = await getOrCreateUser(repo, {
    supabaseUid: supabaseUser.id,
    email: supabaseUser.email ?? null,
    phone: supabaseUser.phone ?? null,
  });

  try {
    const body = await request.json();
    const updated = await updateProfile(repo, appUser.id, {
      displayName: body.displayName,
      username: body.username,
      profileState: body.profileState,
      country: body.country,
      city: body.city,
      interests: body.interests,
      koreanXIdentity: body.koreanXIdentity,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid request');
  }
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return unauthorized('Not authenticated');
  }

  const appUser = await getOrCreateUser(repo, {
    supabaseUid: supabaseUser.id,
    email: supabaseUser.email ?? null,
    phone: supabaseUser.phone ?? null,
  });

  await repo.deactivate(appUser.id);
  return NextResponse.json({ success: true });
}
