import { supabase } from './supabase';
import type { user_role } from '../types/database';

export const getCurrentUserRole = async (userId: string): Promise<user_role | null> => {
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (error || !data) return null;
  return data.role as user_role;
};