'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SHORTCUTS = [
  { key: 'g h', desc: 'Go to home feed' },
  { key: 'g s', desc: 'Go to search' },
  { key: 'g t', desc: 'Go to trending' },
  { key: 'g p', desc: 'Go to profile' },
  { key: 'g m', desc: 'Go to messages' },
  { key: 'g n', desc: 'Go to notifications' },
  { key: '?', desc: 'Show keyboard shortcuts' },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [pending, setPending] = useState('');

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger in inputs/textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) {
        return;
      }

      if (e.key === '?') {
        setShowHelp((v) => !v);
        return;
      }

      if (e.key === 'Escape') {
        setShowHelp(false);
        setPending('');
        return;
      }

      if (pending === 'g') {
        setPending('');
        switch (e.key) {
          case 'h': router.push('/'); break;
          case 's': router.push('/search'); break;
          case 't': router.push('/trending'); break;
          case 'p': router.push('/profile'); break;
          case 'm': router.push('/messages'); break;
          case 'n': router.push('/notifications'); break;
        }
        return;
      }

      if (e.key === 'g') {
        setPending('g');
        setTimeout(() => setPending(''), 1000);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pending, router]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowHelp(false)}>
      <div
        className="mx-4 max-w-sm rounded-xl bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
          <button onClick={() => setShowHelp(false)} className="text-gray-500 hover:text-foreground text-xl">
            &times;
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map(({ key, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{desc}</span>
              <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-800">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
