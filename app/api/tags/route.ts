import { PgTagRepository } from '@/src/infrastructure/repositories/pg-tag-repository';
import { createTag } from '@/src/application/use-cases/tags/manage-tags';
import { requireUserId } from '@/src/interfaces/http/auth';
import { requireAdmin } from '@/src/interfaces/http/require-admin';
import { badRequest, unauthorized, forbidden } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const tagRepo = new PgTagRepository();

export async function GET() {
  const tags = await tagRepo.getAllTags();
  return NextResponse.json({ tags });
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    await requireAdmin(userId);
    const body = await request.json();

    const tag = await createTag(tagRepo, {
      slug: body.slug,
      name: body.name,
      keywords: body.keywords ?? [],
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    if (message === 'Admin access required') return forbidden(message);
    return badRequest(message);
  }
}
