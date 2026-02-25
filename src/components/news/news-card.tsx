type Props = {
  title: string;
  summary: string | null;
  url: string;
  source: string;
  publishedAt: string;
  tags: string[];
};

export function NewsCard({ title, summary, url, source, publishedAt, tags }: Props) {
  return (
    <article className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
          <span>{source}</span>
          <span>{new Date(publishedAt).toLocaleDateString()}</span>
        </div>
        <h3 className="mb-1 font-semibold hover:underline">{title}</h3>
        {summary && (
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            {summary.length > 120 ? summary.slice(0, 120) + '...' : summary}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </a>
    </article>
  );
}
