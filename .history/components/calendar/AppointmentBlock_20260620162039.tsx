import { View, Text, TouchableOpacity } from 'react-native'
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
    const height 
}