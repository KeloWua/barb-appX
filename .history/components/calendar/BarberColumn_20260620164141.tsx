import { View, Text } from 'react-native'
import { AppointmentBlock } from './AppointmentBlock'
import { COLUMN_WIDTH, getDayTotalHeight } from '../../lib/calendarUtils'
import { Appointment } from '../../types/database'

interface Props {
    barberName: string
    appointments: Appointment[]
}

export function BarberColumn({ barberName, appointments }: Props) {
    const height = getDayTotalHeight()

    return (
        <View
            style={{ width: COLUMN_WIDTH }}
            className='border-r border-gray-200'    
        >
            {/* Sticky barber header ( moves with vertical scroll, non ideal, but robust ) */}
            <View className='bg-white py-3 border-b border-gray-200 items-center justify-center'>
                <Text className='font-bold text-gray-800'>{barberName}</Text>
            </View>

            {/* Relative container for absolut positioning */}
            <View style={{ height }} className='relative bg-white'>
                {/* Appointments rendering */}
                {appointments.map((apt))}
            </View>
        </View>
    )
}