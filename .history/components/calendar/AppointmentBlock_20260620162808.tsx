import { View, Text, TouchableOpacity, Touchable } from 'react-native'
import { calculateTop, calculateHeight } from '../../lib/calendarUtils'
import { Appointment } from '../../types/database'

interface Props {
    appointment: Appointment & {
        services?: { name_es: string }
        profiles?: { full_name: string } // Client name
    }
    onPress?: () => void
}

export function AppointmentBlock({ appointment, onPress }: Props) {
    const top = calculateTop(appointment.start_time)
    const height = calculateHeight(appointment.start_time, appointment.end_time)

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={{ top, height }}
            className='absolute left-1 right-1 bg-blue-100 border-1-4 border-blue-600 rounded-md p-2 overflow-hidden shadow-sm'
        >
            <Text className='text-xs font-bold text-blue-900 truncate'>
                {appointment.profiles?.full_name || 'Cliente'}
            </Text>
            <Text className='text'>
                {appointment.services?.name_es || 'Servicio'}
            </Text>
        </TouchableOpacity>
    )
}