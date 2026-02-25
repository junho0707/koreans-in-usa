import { NextRequest } from 'next/server';

export function requireUserId(request: NextRequest): number {
  const header = request.headers.get('x-user-id');
  if (!header) {
    throw new Error('Missing x-user-id header');
  }

  const parsed = Number(header);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('Invalid x-user-id header');
  }

  return parsed;
}
