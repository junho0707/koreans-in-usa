import { PgTagRepository } from '@/src/infrastructure/repositories/pg-tag-repository';
import { updateTag, deleteTag } from '@/src/application/use-cases/tags/manage-tags';
import { requireUserId } from '@/src/interfaces/http/auth';
import { requireAdmin } from '@/src/interfaces/http/require-admin';
import { badRequest, unauthorized, forbidden } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const tagRepo = new PgTagRepository();

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    await requireAdmin(userId);
    const { id } = await context.params;
    const body = await request.json();

    const tag = await updateTag(tagRepo, Number(id), {
      slug: body.slug,
      name: body.name,
      keywords: body.keywords,
    });

    return NextResponse.json({ tag });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    if (message === 'Admin access required') return forbidden(message);
    return badRequest(message);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    await requireAdmin(userId);
    const { id } = await context.params;

    await deleteTag(tagRepo, Number(id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    if (message === 'Admin access required') return forbidden(message);
    return badRequest(message);
  }
}
