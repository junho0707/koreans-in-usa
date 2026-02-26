'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type NotifPrefs = {
  emailNotifications: boolean;
  dm: boolean;
  comments: boolean;
  follows: boolean;
  mentions: boolean;
};

export default function SettingsPage() {
  const { user, loading, supabase } = useAuth();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (user) {
      fetch('/api/profile/notifications')
        .then((r) => r.json())
        .then(setPrefs)
        .catch(() => {});
    }
  }, [user]);

  if (loading) return <div className="mx-auto max-w-lg px-4 py-16">Loading...</div>;
  if (!user) { router.push('/login'); return null; }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    await fetch('/api/profile', { method: 'DELETE' });
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  async function togglePref(key: keyof NotifPrefs) {
    if (!prefs) return;
    const newVal = !prefs[key];
    setPrefs({ ...prefs, [key]: newVal });
    setSavingPrefs(true);
    await fetch('/api/profile/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: newVal }),
    });
    setSavingPrefs(false);
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="space-y-6">
        {/* Account section */}
        <section className="rounded-lg border p-4 dark:border-gray-700">
          <h2 className="mb-3 font-semibold">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Display Name</span>
              <span>{user.displayName}</span>
            </div>
            {user.email && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Email</span>
                <span>{user.email}</span>
              </div>
            )}
            <Link
              href="/profile/edit"
              className="block text-sm text-blue-600 hover:underline"
            >
              Edit profile
            </Link>
          </div>
        </section>

        {/* Notification preferences */}
        <section className="rounded-lg border p-4 dark:border-gray-700">
          <h2 className="mb-3 font-semibold">
            Notifications
            {savingPrefs && <span className="ml-2 text-xs text-gray-400">Saving...</span>}
          </h2>
          {prefs ? (
            <div className="space-y-3">
              {([
                { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive email for important updates' },
                { key: 'comments' as const, label: 'Comments', desc: 'When someone comments on your post' },
                { key: 'dm' as const, label: 'Direct Messages', desc: 'When someone sends you a message' },
                { key: 'follows' as const, label: 'Follows', desc: 'When someone follows you' },
                { key: 'mentions' as const, label: 'Mentions', desc: 'When someone mentions you' },
              ]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <button
                    onClick={() => togglePref(key)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      prefs[key] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                        prefs[key] ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading preferences...</p>
          )}
        </section>

        {/* Quick links */}
        <section className="rounded-lg border p-4 dark:border-gray-700">
          <h2 className="mb-3 font-semibold">Quick Links</h2>
          <div className="space-y-2">
            <Link href="/bookmarks" className="block text-sm text-blue-600 hover:underline">
              Saved Posts
            </Link>
            <Link href="/messages" className="block text-sm text-blue-600 hover:underline">
              Messages
            </Link>
            <Link href="/guidelines" className="block text-sm text-blue-600 hover:underline">
              Community Guidelines
            </Link>
          </div>
        </section>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Sign Out
        </button>

        {/* Danger zone */}
        <section className="rounded-lg border border-red-200 p-4 dark:border-red-900">
          <h2 className="mb-2 font-semibold text-red-600">Danger Zone</h2>
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-red-600">
                Are you sure? This will permanently deactivate your account. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-lg border px-4 py-2 text-sm dark:border-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete my account
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
