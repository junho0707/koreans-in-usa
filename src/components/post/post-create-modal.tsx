'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { Markdown } from '@/src/components/ui/markdown';
import { MarkdownToolbar } from '@/src/components/ui/markdown-toolbar';
import { saveDraft, loadDraft, clearDraft } from '@/src/lib/drafts';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

type Props = {
  onClose: () => void;
  defaultRegion?: string;
};

const MAX_TITLE = 150;
const MAX_BODY = 10000;

export function PostCreateModal({ onClose, defaultRegion }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [type, setType] = useState<'GENERAL' | 'QA' | 'TIP'>('GENERAL');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [scopeUsa, setScopeUsa] = useState(!defaultRegion);
  const [scopeRegion, setScopeRegion] = useState(!!defaultRegion);
  const [regionId, setRegionId] = useState(defaultRegion ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && (draft.title || draft.body)) {
      setHasDraft(true);
    }
  }, []);

  function restoreDraft() {
    const draft = loadDraft();
    if (draft) {
      setTitle(draft.title);
      setBody(draft.body);
      setType(draft.type as 'GENERAL' | 'QA' | 'TIP');
      setImageUrl(draft.imageUrl);
      setHasDraft(false);
    }
  }

  function dismissDraft() {
    clearDraft();
    setHasDraft(false);
  }

  // Auto-save draft every 5 seconds when content changes
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    if (title || body) {
      autoSaveTimer.current = setTimeout(() => {
        saveDraft({ title, body, type, imageUrl });
      }, 5000);
    }
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, body, type, imageUrl]);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        title,
        body,
        imageUrl: imageUrl || null,
        scopeUsa,
        scopeRegion,
        regionId: scopeRegion ? regionId : null,
        poll: showPoll && pollQuestion.trim() && pollOptions.filter((o) => o.trim()).length >= 2
          ? { question: pollQuestion, options: pollOptions.filter((o) => o.trim()) }
          : undefined,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      clearDraft();
      onClose();
      router.push(`/posts/${data.id}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create post');
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Create Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-foreground text-xl">
            &times;
          </button>
        </div>

        {hasDraft && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-900/30">
            <span className="text-blue-700 dark:text-blue-300">You have an unsaved draft.</span>
            <div className="flex gap-2">
              <button onClick={restoreDraft} className="text-xs font-medium text-blue-600 hover:underline">Restore</button>
              <button onClick={dismissDraft} className="text-xs text-gray-500 hover:underline">Dismiss</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'GENERAL' | 'QA' | 'TIP')}
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="GENERAL">General</option>
              <option value="QA">Q&A</option>
              <option value="TIP">Tip</option>
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium">Title</label>
              <span className={`text-xs ${title.length > MAX_TITLE ? 'text-red-500' : 'text-gray-400'}`}>
                {title.length}/{MAX_TITLE}
              </span>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={MAX_TITLE}
              required
              placeholder="What's on your mind?"
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium">Body</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
                <span className={`text-xs ${body.length > MAX_BODY ? 'text-red-500' : 'text-gray-400'}`}>
                  {body.length}/{MAX_BODY}
                </span>
              </div>
            </div>
            {showPreview ? (
              <div className="min-h-[120px] rounded-lg border p-3 dark:border-gray-700">
                {body ? <Markdown content={body} /> : <p className="text-sm text-gray-400">Nothing to preview</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <MarkdownToolbar
                  textareaId="post-body"
                  onInsert={(before, after) => {
                    setBody((prev) => prev + before + after);
                  }}
                />
                <textarea
                  id="post-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={MAX_BODY}
                  required
                  rows={6}
                  placeholder="Supports **bold**, *italic*, `code`, [links](url), and more..."
                  className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Image URL (optional)</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              type="url"
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            />
            {imageUrl && (
              <div className="mt-2 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className="max-h-32 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showPoll ? 'Remove poll' : '+ Add poll'}
            </button>
            {showPoll && (
              <div className="mt-2 space-y-2 rounded-lg border p-3 dark:border-gray-700">
                <input
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Poll question"
                  className="w-full rounded border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions];
                        updated[idx] = e.target.value;
                        setPollOptions(updated);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 rounded border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                        className="text-xs text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    + Add option
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={scopeUsa}
                onChange={(e) => setScopeUsa(e.target.checked)}
              />
              USA-wide
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={scopeRegion}
                onChange={(e) => setScopeRegion(e.target.checked)}
              />
              Region
            </label>
          </div>

          {scopeRegion && (
            <div>
              <label className="mb-1 block text-sm font-medium">Region</label>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                required
                className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="">Select region</option>
                <option value="NE">Northeast</option>
                <option value="S">South</option>
                <option value="MW">Midwest</option>
                <option value="W">West</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || title.length > MAX_TITLE || body.length > MAX_BODY}
            className="w-full rounded-lg bg-foreground px-4 py-2 text-background disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Post'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
