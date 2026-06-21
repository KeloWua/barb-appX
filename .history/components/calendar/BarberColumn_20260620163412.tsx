import { View, Text } from 'react-native'
import { AppointmentBlock } from './AppointmentBlock'
import { COLUMN_WIDTH, getDayTotalHeight } from '../../lib/calendarUtils'

interface Props {
    barberName: string
    appointments
}