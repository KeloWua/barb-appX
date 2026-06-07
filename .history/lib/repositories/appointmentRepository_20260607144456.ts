import { supabase } from "../supabase"
import type { AppointmentWithRelations } from "../../types/app"
import type { appointment_status } from "../../types/database"

// pure SQL (for migration): SELECT a.*, b.name, p.full_name, s.name_es FROM appointments a JOIN barbers b...
export const getAppointmentsByDate = async (dateStr: string, barberId?: string) => {
    try
}