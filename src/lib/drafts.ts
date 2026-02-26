const DRAFT_KEY = 'kusa_post_draft';

export type PostDraft = {
  title: string;
  body: string;
  type: string;
  imageUrl: string;
  savedAt: number;
};

export function saveDraft(draft: Omit<PostDraft, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  const data: PostDraft = { ...draft, savedAt: Date.now() };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

export function loadDraft(): PostDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as PostDraft;
    // Expire drafts after 24 hours
    if (Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) {
      clearDraft();
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DRAFT_KEY);
}
