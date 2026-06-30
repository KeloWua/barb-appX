import { supabase } from "../supabase"
import type { AppointmentWithRelations } from "../../types/app"
import type { appointment_status, HoldPayload  } from "../../types/database"

// pure SQL (for migration): 
// SELECT a.*, b.name, p.full_name, s.name_es FROM appointments a JOIN barbers b...
export const getAppointmentsByRange = async (
    startDate: string,
    endDate: string,
    barberId?: string
) => {
    try {
        let query = supabase.from('appointments').select(`
            *,
            barber:barbers(id, name, photo_url, color_code),
            client:profiles!appointments_client_id_fkey(id, full_name, phone),
            service:services(id, name_es, duration_minutes, price)
            `)
            .gte('start_time', `${startDate}T00:00:00.000Z`)
            .lte('start_time', `${endDate}T23:59:59.999Z`)
            .order('start_time', { ascending: true })
        
            if (barberId) query = query.eq('barber_id', barberId)
            
            const { data, error } = await query
            if (error) throw error
            return { data: data as unknown as AppointmentWithRelations[], error: null }
    } catch (error) {
        return { data: null, error: error as Error }
    }
}

export const updateAppointmentStatus = async (id: string, status: appointment_status) => {
    const { data, error } = await supabase.from('appointments')
        .update({ status })
        .eq('id', id)
        .select().single()

    return { data, error }
}

export const holdAppointmentSlot = async (payload: HoldPayload) => {
    // Expires exactly 2 minutes from now
    const expiresAt = new Date(new Date().getTime() + 2 * 60000).toISOString()
    
    const { data, error } = await supabase
        .from('appointments')
        .insert({
            ...payload,
            status: 'holding',
            expires_at: expiresAt
        })
        .select()
        .single()

    return { data, error }
}

export const releaseAppointmentHold = async (id: string) => {
    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
    
    return { error }
}