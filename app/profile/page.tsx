'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="mx-auto max-w-lg px-4 py-16">Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link
          href="/profile/edit"
          className="rounded-lg bg-foreground px-4 py-2 text-sm text-background"
        >
          Edit
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <span className="text-sm text-gray-500">Display Name</span>
          <p className="font-medium">{user.displayName}</p>
        </div>
        {user.email && (
          <div>
            <span className="text-sm text-gray-500">Email</span>
            <p>{user.email}</p>
          </div>
        )}
        {user.phone && (
          <div>
            <span className="text-sm text-gray-500">Phone</span>
            <p>{user.phone}</p>
          </div>
        )}
      </div>
    </main>
  );
}
