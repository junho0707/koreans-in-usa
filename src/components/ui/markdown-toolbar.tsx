'use client';

type Props = {
  textareaId: string;
  onInsert: (before: string, after: string) => void;
};

const TOOLS = [
  { label: 'B', title: 'Bold', before: '**', after: '**' },
  { label: 'I', title: 'Italic', before: '*', after: '*' },
  { label: '<>', title: 'Code', before: '`', after: '`' },
  { label: '[]', title: 'Link', before: '[', after: '](url)' },
  { label: 'H', title: 'Heading', before: '## ', after: '' },
  { label: '•', title: 'List', before: '- ', after: '' },
  { label: '>', title: 'Quote', before: '> ', after: '' },
  { label: '---', title: 'Divider', before: '\n---\n', after: '' },
];

export function MarkdownToolbar({ onInsert }: Props) {
  return (
    <div className="flex gap-1 border-b pb-2 dark:border-gray-700">
      {TOOLS.map((tool) => (
        <button
          key={tool.title}
          type="button"
          title={tool.title}
          onClick={() => onInsert(tool.before, tool.after)}
          className="rounded px-2 py-1 text-xs font-mono text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
