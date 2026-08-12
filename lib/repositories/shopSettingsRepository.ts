import { supabase } from '../supabase'

export async function getShopSettings() { 
    return supabase
        .from('shop_settings')
        .select('*')
        .single()
}