'use client';

import { createSupabaseBrowserClient } from '@/src/lib/supabase/client';
import { AuthProvider } from '@/src/components/providers/auth-context';
import { useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

type AppUser = {
  id: number;
  supabaseUid: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  displayName: string;
  role: string;
};

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function resolveUser(supabaseUser: SupabaseUser | null) {
    if (!supabaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      resolveUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthProvider user={user} loading={loading} supabase={supabase}>
      {children}
    </AuthProvider>
  );
}
