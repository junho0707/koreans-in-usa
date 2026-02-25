import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <h1 className="mb-2 text-4xl font-bold">404</h1>
      <p className="mb-6 text-gray-500">Page not found</p>
      <Link
        href="/"
        className="rounded-lg bg-foreground px-4 py-2 text-sm text-background"
      >
        Go Home
      </Link>
    </main>
  );
}
