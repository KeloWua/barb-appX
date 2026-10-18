import { supabase } from '../supabase'

export const SHOP_COLUMNS = {
    name: 'business_name',
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
        : await supabase.from('shop_settings').insert({ opening_time: '09:00:00', closing_time: '21:00:00', timezone: 'Europe/Madrid', ...values })
    if (error) throw new Error(error.message)
}

// Creates (or reuses) the barber row linked to the admin's own profile, so the owner is bookable
// right away, and gives it the default weekly schedule (09:00-21:00, 7 days; day_of_week 0 = Sunday).
export async function createOwnerBarber(profileId: string, name: string, colorCode: string) {
    const { data: existing, error: readError } = await supabase
        .from('barbers')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle()
    if (readError) throw new Error(readError.message)

    let barberId = existing?.id as string | undefined
    if (barberId) {
        const { error } = await supabase.from('barbers').update({ name, is_active: true }).eq('id', barberId)
        if (error) throw new Error(error.message)
    } else {
        const { data, error } = await supabase
            .from('barbers')
            .insert({ profile_id: profileId, name, color_code: colorCode, is_active: true })
            .select('id')
            .single()
        if (error) throw new Error(error.message)
        barberId = data.id as string
    }

    const { count, error: countError } = await supabase
        .from('barber_schedules')
        .select('id', { count: 'exact', head: true })
        .eq('barber_id', barberId)
    if (countError) throw new Error(countError.message)

    if ((count ?? 0) === 0) {
        const rows = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
            barber_id: barberId,
            day_of_week: day,
            start_time: '09:00:00',
            end_time: '21:00:00',
            is_day_off: false,
        }))
        const { error } = await supabase.from('barber_schedules').insert(rows)
        if (error) throw new Error(error.message)
    }
}
