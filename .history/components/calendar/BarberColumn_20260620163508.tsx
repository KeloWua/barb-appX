import { View, Text } from 'react-native'
import { AppointmentBlock } from './AppointmentBlock'
import { COLUMN_WIDTH, getDayTotalHeight } from '../../lib/calendarUtils'
import { Appointment } from '../../types/database'

interface Props {
    barberName: string
    appointments: Appointment[]
}