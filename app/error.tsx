'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <h1 className="mb-2 text-4xl font-bold">Something went wrong</h1>
      <p className="mb-6 text-gray-500">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-foreground px-4 py-2 text-sm text-background"
      >
        Try Again
      </button>
    </main>
  );
}
