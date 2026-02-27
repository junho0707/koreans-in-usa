'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { NotificationBell } from '@/src/components/notifications/notification-bell';
import { ThemeToggle } from '@/src/components/layout/theme-toggle';
import { LanguageToggle } from '@/src/components/layout/language-toggle';
import { useI18n } from '@/src/lib/i18n/context';
import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const { user, loading, supabase } = useAuth();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_LINKS = [
    { href: '/', label: t('nav.home') },
    { href: '/feed/usa', label: 'Q&A' },
    { href: '/communities', label: 'Communities' },
    { href: '/search', label: t('nav.search') },
  ];

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
          <LanguageToggle />
          <ThemeToggle />
          {loading ? null : user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link
                href="/bookmarks"
                className="text-sm text-gray-600 hover:text-foreground dark:text-gray-400"
              >
                {t('nav.saved')}
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium"
              >
                {user.displayName}
              </Link>
              <Link
                href="/settings"
                className="text-sm text-gray-600 hover:text-foreground dark:text-gray-400"
                title="Settings"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-foreground dark:text-gray-400"
              >
                {t('nav.signOut')}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-foreground px-3 py-1.5 text-sm text-background"
            >
              {t('nav.signIn')}
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
                  {t('nav.saved')}
                </Link>
                <Link href="/profile" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  {user.displayName}
                </Link>
                <Link href="/settings" className="block py-2 text-sm text-gray-600 dark:text-gray-400" onClick={() => setMenuOpen(false)}>
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full py-2 text-left text-sm text-gray-600 dark:text-gray-400"
                >
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <Link href="/login" className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                {t('nav.signIn')}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
}
