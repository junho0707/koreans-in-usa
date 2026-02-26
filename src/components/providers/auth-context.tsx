'use client';

import { createContext, useContext } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

type AppUser = {
  id: number;
  supabaseUid: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  displayName: string;
  role: string;
};

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  supabase: SupabaseClient;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  user,
  loading,
  supabase,
  children,
}: AuthContextType & { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ user, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
