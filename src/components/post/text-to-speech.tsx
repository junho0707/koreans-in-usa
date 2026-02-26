'use client';

import { useState, useEffect, useRef } from 'react';

type Props = {
  text: string;
};

export function TextToSpeech({ text }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported('speechSynthesis' in window);
  }, []);

  function handleToggle() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const plainText = text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links to text
      .replace(/#{1,6}\s+/g, '') // Remove heading markers
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // Remove bold/italic
      .replace(/[>\-*]/g, '') // Remove blockquote/list markers
      .trim();

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-foreground"
      title={speaking ? 'Stop reading' : 'Read aloud'}
    >
      {speaking ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )}
      <span className="text-xs">{speaking ? 'Stop' : 'Listen'}</span>
    </button>
  );
}
