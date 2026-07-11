import { Platform } from 'react-native'
import { Share } from 'react-native'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { AppointmentWithRelations } from '../types/app'
import { getMapsUrl, SHOP_NAME, SHOP_PHONE } from '../lib/shopInfo'

export function useShareAppointment() {
    const shareAppointment = async (appointment: AppointmentWithRelations) => {
            const message = [
                `💈 Cita en ${SHOP_NAME}`,
                '',
                `Servicio: ${appointment.service.name_es}`,
                `Barbero: ${appointment.barber.name}`,
                '',
                `Tienes cita el ${format(
                    new Date(appointment.start_time),
                    "EEEE d 'de' MMMM yyyy",
                    { locale: es }
                )} de ${format(
                    new Date(appointment.start_time),
                    'HH:mm'
                )} a ${format(
                    new Date(appointment.end_time),
                    'HH:mm'
                )}.`,
                '',
                `📞 ${SHOP_PHONE}`,
                `📍 ${getMapsUrl()}`
            ].join('\n')
    
            if (Platform.OS === 'web') {
                if (navigator.share) {
                    try {
                        await navigator.share({ title: 'Cita en la barbería', text: message })
                    } catch {
                        // user cancelled
                    }
                } else {
                    await navigator.clipboard.writeText(message)
                    window.alert('Copiado al portapapeles (tu navegador no soporta compartir directamente)')
                }
                return
            }
    
            try {
                await Share.share({ message })
            } catch {
                // user cancelled
            }
        }

    return { shareAppointment }
}