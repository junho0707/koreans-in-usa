'use client';

import { useState, useEffect } from 'react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = window.scrollY / docHeight;
      setProgress(Math.min(scrolled * 100, 100));
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
      <div
        className="h-full bg-blue-500 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
