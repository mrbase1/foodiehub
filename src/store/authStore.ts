import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  signIn: async (email: string, password: string, captchaToken?: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? {
        captchaToken
      } : undefined
    });
    if (error) throw error;
    set({ user: data.user, isAdmin: data.user?.email?.endsWith('@admin.com') || false });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAdmin: false });
  },
  checkUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    set({ 
      user, 
      isAdmin: user?.email?.endsWith('@admin.com') || false,
      loading: false 
    });
  },
}));