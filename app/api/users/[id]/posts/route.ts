import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgUserRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = Number(id);
    if (!userId || isNaN(userId)) return badRequest('Invalid user ID');

    const { searchParams } = request.nextUrl;
    const cursor = searchParams.get('cursor') ? Number(searchParams.get('cursor')) : undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const result = await repo.getPostsByUser(userId, cursor, limit);
    return NextResponse.json(result);
  } catch {
    return badRequest('Failed to fetch posts');
  }
}
