'use client';

import { useState, useEffect } from 'react';

type Announcement = {
  id: number;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success';
};

const BANNER_COLORS = {
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
};

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/announcements/active')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.announcement) {
          const dismissedId = localStorage.getItem('dismissed_announcement');
          if (dismissedId !== String(data.announcement.id)) {
            setAnnouncement(data.announcement);
          }
        }
      })
      .catch(() => {});
  }, []);

  function dismiss() {
    if (announcement) {
      localStorage.setItem('dismissed_announcement', String(announcement.id));
    }
    setDismissed(true);
  }

  if (!announcement || dismissed) return null;

  return (
    <div className={`mb-4 rounded-lg border p-3 ${BANNER_COLORS[announcement.type]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">{announcement.title}</p>
          {announcement.body && (
            <p className="mt-0.5 text-xs opacity-80">{announcement.body}</p>
          )}
        </div>
        <button onClick={dismiss} className="ml-4 text-sm opacity-60 hover:opacity-100">
          &times;
        </button>
      </div>
    </div>
  );
}
