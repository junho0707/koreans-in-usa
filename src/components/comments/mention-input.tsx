'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type MentionUser = {
  id: number;
  displayName: string;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

export function MentionInput({ value, onChange, placeholder, rows = 3, className }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);

  const fetchUsers = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.items ?? []);
      setShowSuggestions(data.items?.length > 0);
      setSelectedIdx(0);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    if (!mentionQuery) return;
    const timer = setTimeout(() => fetchUsers(mentionQuery), 200);
    return () => clearTimeout(timer);
  }, [mentionQuery, fetchUsers]);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value;
    onChange(newValue);

    const cursorPos = e.target.selectionStart;
    const textBefore = newValue.slice(0, cursorPos);
    const match = textBefore.match(/@(\w*)$/);

    if (match) {
      setMentionStart(cursorPos - match[0].length);
      setMentionQuery(match[1]);
    } else {
      setMentionQuery('');
      setShowSuggestions(false);
      setMentionStart(-1);
    }
  }

  function insertMention(user: MentionUser) {
    if (mentionStart < 0) return;
    const before = value.slice(0, mentionStart);
    const cursorPos = textareaRef.current?.selectionStart ?? value.length;
    const after = value.slice(cursorPos);
    const mention = `@${user.displayName} `;
    onChange(before + mention + after);
    setShowSuggestions(false);
    setMentionQuery('');
    setMentionStart(-1);

    // Focus back and set cursor position
    setTimeout(() => {
      const ta = textareaRef.current;
      if (ta) {
        const pos = before.length + mention.length;
        ta.focus();
        ta.setSelectionRange(pos, pos);
      }
    }, 0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(suggestions[selectedIdx]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />
      {showSuggestions && (
        <div className="absolute bottom-full left-0 mb-1 w-64 rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {suggestions.map((user, idx) => (
            <button
              key={user.id}
              onClick={() => insertMention(user)}
              className={`block w-full px-3 py-2 text-left text-sm ${
                idx === selectedIdx ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {user.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
