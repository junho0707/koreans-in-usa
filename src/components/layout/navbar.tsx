'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import Link from 'next/link';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'USA Feed' },
  { href: '/groups/northeast', label: 'Northeast' },
  { href: '/groups/south', label: 'South' },
  { href: '/groups/midwest', label: 'Midwest' },
  { href: '/groups/west', label: 'West' },
  { href: '/search', label: 'Search' },
];

export function Navbar() {
  const { user, loading, supabase } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          Koreans in USA
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 hover:text-foreground dark:text-gray-400"
            >
              {link.label}
            </Link>
          ))}
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/bookmarks"
                className="text-sm text-gray-600 hover:text-foreground dark:text-gray-400"
              >
                Saved
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium"
              >
                {user.displayName}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-foreground"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-foreground px-3 py-1.5 text-sm text-background"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 px-4 py-2 md:hidden dark:border-gray-800">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm text-gray-600 dark:text-gray-400"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!loading && (
            user ? (
              <>
                <Link href="/bookmarks" className="block py-2 text-sm text-gray-600 dark:text-gray-400" onClick={() => setMenuOpen(false)}>
                  Saved
                </Link>
                <Link href="/profile" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  {user.displayName}
                </Link>
                <button onClick={handleSignOut} className="block py-2 text-sm text-gray-500">
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
}
