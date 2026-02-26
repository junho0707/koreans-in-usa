'use client';

import { useMemo } from 'react';

// Simple markdown-like rendering without external deps
// Supports: **bold**, *italic*, `code`, [links](url), headings, lists, blockquotes
function parseMarkdown(text: string): string {
  return text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (```)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="my-2 overflow-x-auto rounded bg-gray-100 p-3 text-sm dark:bg-gray-800"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="rounded bg-gray-100 px-1 py-0.5 text-sm dark:bg-gray-800">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline dark:text-blue-400">$1</a>')
    // Bare URLs
    .replace(/(^|[\s(])(https?:\/\/[^\s)<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline dark:text-blue-400">$2</a>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="mt-4 mb-2 text-lg font-semibold">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="mt-4 mb-2 text-xl font-semibold">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="mt-4 mb-2 text-2xl font-bold">$1</h1>')
    // Blockquotes
    .replace(/^&gt; (.+)$/gm, '<blockquote class="my-2 border-l-4 border-gray-300 pl-4 text-gray-600 dark:border-gray-600 dark:text-gray-400">$1</blockquote>')
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-4 border-gray-200 dark:border-gray-700" />')
    // Line breaks
    .replace(/\n/g, '<br />');
}

export function Markdown({ content }: { content: string }) {
  const html = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
