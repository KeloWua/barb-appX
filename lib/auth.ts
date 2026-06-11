import { supabase } from './supabase';
import type { user_role, Profile } from '../types/database';

export const getCurrentUserRole = async (userId: string): Promise<user_role | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return data.role as user_role;
}

export const getCurrentUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data as Profile
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}