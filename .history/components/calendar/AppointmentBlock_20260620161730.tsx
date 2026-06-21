import { View, Text, TouchableOpacity } from 'react-native'
import { calculateTop, calculateHeight } from '../../lib/calendarUtils'
import { Appointment } from '../../types/database'

interface Props {
    appointment: Appointment & {
        services?: { name_es: string }
        profiles?
    }
}