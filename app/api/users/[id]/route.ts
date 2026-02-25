import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgUserRepository();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = Number(id);
    if (!userId || isNaN(userId)) return badRequest('Invalid user ID');

    const user = await repo.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return public profile (exclude sensitive fields)
    return NextResponse.json({
      id: user.id,
      displayName: user.displayName,
      profileState: user.profileState,
      city: user.city,
      interests: user.interests,
      koreanXIdentity: user.koreanXIdentity,
      createdAt: user.createdAt,
    });
  } catch {
    return badRequest('Failed to fetch user');
  }
}
