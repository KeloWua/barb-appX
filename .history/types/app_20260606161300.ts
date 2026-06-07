import { z } from 'zod';
import type { Appointment, Barber, BarberSchedule, Profile, Service } from './database';

export interface BarberWithSchedule extends Barber { schedules: BarberSchedule[]; }
export interface AppointmentWithRelations extends Appointment {
  barber: Pick<Barber, 'id' | 'name' | 'photo_url' | 'color_code'>;
  client: Pick<Profile, 'id' | 'full_name' | 'phone'>;
  service: Pick<Service, 'id' | 'name_es' | 'duration_minutes' | 'price'>;
}

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
export type LoginFormData = z.infer<typeof loginSchema>;