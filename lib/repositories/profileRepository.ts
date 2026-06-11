import { supabase } from "../supabase"
import type { Profile } from "../../types/database"

// pure SQL (for migration): 
// SELECT * FROM profiles WHERE id = userId
export const getProfile = async (userId: string): Promise<{ data: Profile | null, error: Error | null }> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    if (error) return { data: null, error: error }
    return { data: data as Profile, error: null }
}

// UPDATE profiles SET ... WHERE id = userId
export const updateProfile = async (
    userId: string,
    payload: Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>
): Promise<{ data: Profile | null, error: Error | null }> => {
    const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select()
        .single()
    if (error) return { data: null, error: error }
    return { data: data as Profile, error: null }
}