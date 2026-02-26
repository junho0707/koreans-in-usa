'use client';

import { useMemo } from 'react';

type Heading = {
  level: number;
  text: string;
  anchor: string;
};

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const anchor = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      headings.push({ level, text, anchor });
    }
  }
  return headings;
}

export function TableOfContents({ content }: { content: string }) {
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length < 3) return null;

  return (
    <div className="mb-6 rounded-lg border p-4 dark:border-gray-700">
      <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Contents</h4>
      <nav className="space-y-1">
        {headings.map((h, idx) => (
          <a
            key={idx}
            href={`#${h.anchor}`}
            className="block text-sm text-gray-600 hover:text-foreground dark:text-gray-400"
            style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
