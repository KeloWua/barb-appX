import { supabase } from '../supabase'
import type { BarberSchedule } from '../../types/database'

export const getBarberSchedule = async (barberId: string) => {
    const { data, error } = await supabase
    .from('barber_schedules')
    .select('*')
    .eq('barber_id', barberId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })
    return { data: data as BarberSchedule[] | null, error }
}

export const upsertScheduleBlock = async (block: {
    id?: string
    barber_id: string
    day_of_week: number
    start_time: string
    end_time: string
    is_day_off: boolean
}) => {
    const { data, error } = await supabase
        .from('barber_schedules')
        .upsert(block)
        .select()
        .single()

    return { data, error }
}

export const deleteScheduleBlock = async (id: string) => {
    const { error } = await supabase
        .from('barber_schedules')
        .delete()
        .eq('id', id)

    return { error }
}