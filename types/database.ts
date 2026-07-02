export type user_role = 'admin' | 'barber' | 'client';
export type appointment_status = 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'holding';

export interface Profile { id: string; full_name: string; email: string | null; phone: string | null; role: user_role; avatar_url: string | null; is_vip: boolean; internal_notes: string | null; created_at: string; }
export interface Barber { id: string; profile_id: string | null; name: string; photo_url: string | null; color_code: string; is_active: boolean; }
export interface Service { id: string; name_es: string; name_en: string; duration_minutes: number; price: number; is_active: boolean; }
export interface BarberSchedule { id: string; barber_id: string; day_of_week: number; start_time: string; end_time: string; is_day_off: boolean; }
export interface Appointment { id: string; barber_id: string; client_id: string; service_id: string; start_time: string; end_time: string; status: appointment_status; created_by: string | null; notes: string | null; expires_at: string | null; }
export interface HoldPayload { barber_id: string; client_id: string; service_id: string; start_time: string; end_time: string; }