import { supabase } from "../supabase"
import type { AppointmentWithRelations } from "../../types/app"
import type { appointment_status } from "../../types/database"

// pure SQL (for migration): SELECT a.*, b.name, p.full_name, s.name_es FROM appointments a JOIN barbers b...
export const getAppointmentsByDate = async (dateStr: string, barberId?: string) => {
    try {
        let query = supabase.from('appointments').select(`*, barber:barbers(id, name, photo_url, color_code),
            client:profiles!appointments_client_id_fkey(id, full_name, phone),
            service:services(id, name_es, duration_minutes, price)
            `)
            .gte('start_time', `${dateStr}`)
    }
}