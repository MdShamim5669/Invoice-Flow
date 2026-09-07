import React from 'react';
import Image from 'next/image';

interface ClientAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AVATAR_EMOJIS: Record<string, { emoji: string; bg: string }> = {
  'brooklyn simmons': { emoji: '👩🏽‍🦱', bg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800' },
  'dianne russell': { emoji: '👤', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-500' },
  'annette black': { emoji: '👩🏾‍🦰', bg: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800' },
  'robert fox': { emoji: '👨🏼‍🦰', bg: 'bg-orange-100 dark:bg-orange-950/40 text-orange-800' },
  'kristin watson': { emoji: '👩🏻‍🌾', bg: 'bg-blue-100 dark:bg-blue-950/40 text-blue-800' },
  'arthur cooper': { emoji: '👨🏽‍💼', bg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800' },
  'theresa webb': { emoji: '👩🏻', bg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-800' },
  'sophia chen': { emoji: '👩🏻‍💻', bg: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800' },
  'james carter': { emoji: '👨🏿‍💻', bg: 'bg-violet-100 dark:bg-violet-950/40 text-violet-800' },
  'alex rivera': { emoji: '🧑🏽‍💻', bg: 'bg-teal-100 dark:bg-teal-950/40 text-teal-800' },
  'elena rostova': { emoji: '👩🏼‍💼', bg: 'bg-sky-100 dark:bg-sky-950/40 text-sky-800' },
};

export function ClientAvatar({ name, avatarUrl, size = 'md' }: ClientAvatarProps) {
  const normalized = name.toLowerCase().trim();

  // If Sophia Chen or James Carter, use actual photo assets
  if (normalized.includes('sophia')) {
    return (
      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs">
        <Image src="/images/avatar_sophia.jpg" alt={name} fill className="object-cover" />
      </div>
    );
  }

  if (normalized.includes('james')) {
    return (
      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs">
        <Image src="/images/avatar_james.jpg" alt={name} fill className="object-cover" />
      </div>
    );
  }

  if (avatarUrl) {
    return (
      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs">
        <Image src={avatarUrl} alt={name} fill className="object-cover" />
      </div>
    );
  }

  const match = AVATAR_EMOJIS[normalized];
  if (match) {
    return (
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 shadow-2xs border border-slate-200/60 dark:border-slate-800 ${match.bg}`}
      >
        <span>{match.emoji}</span>
      </div>
    );
  }

  // Initial avatar fallback with soft gradient
  const initial = name.charAt(0).toUpperCase() || 'C';
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
      {initial}
    </div>
  );
}
