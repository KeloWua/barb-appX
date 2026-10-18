import { supabase } from '../supabase'

// TODO(schema): confirm real column names of public.shop_settings.
export const SHOP_COLUMNS = {
    name: 'shop_name',
    phone: 'phone',
    email: 'email',
    address: 'address',
} as const

export type BusinessInfo = { name: string; phone: string; email: string; address: string }

export async function saveBusinessInfo(info: BusinessInfo) {
    const values = {
        [SHOP_COLUMNS.name]: info.name,
        [SHOP_COLUMNS.phone]: info.phone,
        [SHOP_COLUMNS.email]: info.email,
        [SHOP_COLUMNS.address]: info.address,
    }
    const { data: existing, error: readError } = await supabase.from('shop_settings').select('id').maybeSingle()
    if (readError) throw new Error(readError.message)

    const { error } = existing
        ? await supabase.from('shop_settings').update(values).eq('id', existing.id)
        : await supabase.from('shop_settings').insert(values)
    if (error) throw new Error(error.message)
}

export async function createBarber(name: string, colorCode: string) {
    const { error } = await supabase.from('barbers').insert({ name, color_code: colorCode, is_active: true })
    if (error) throw new Error(error.message)
}
