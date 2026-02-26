import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          <Link href="/guidelines" className="hover:text-foreground">Community Guidelines</Link>
          <span>&middot;</span>
          <Link href="/search" className="hover:text-foreground">Search</Link>
          <span>&middot;</span>
          <Link href="/trending" className="hover:text-foreground">Trending</Link>
        </div>
        <p className="mt-3 text-center text-sm text-gray-400">
          Koreans in USA &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
