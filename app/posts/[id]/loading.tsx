export default function PostLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="flex gap-3">
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <hr className="border-gray-200 dark:border-gray-800" />
        <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2 py-2">
              <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
