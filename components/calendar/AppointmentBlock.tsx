import { Text, TouchableOpacity } from 'react-native'
import { calculateTop, calculateHeight } from '../../lib/calendarUtils'
import { getStatusTheme } from '../../app/(barber)/index'
import { AppointmentWithRelations } from '../../types/app';

interface Props {
    appointment: AppointmentWithRelations;
    onPress?: () => void;
}

export function AppointmentBlock({ appointment, onPress }: Props) {
    const top = calculateTop(appointment.start_time);
    const height = calculateHeight(appointment.start_time, appointment.end_time);

    const statusTheme = getStatusTheme(appointment.status);

    // If height is 50px or less ( 30 mins or less ), we use compact design
    const isCompact = height <= 50


    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={{ top, height }}
            className={`absolute left-1 right-1 border-l-4 rounded-md overflow-hidden shadow-sm ${statusTheme.bg} ${statusTheme.border} ${isCompact ? 'p-1 justify-center' : 'p-2 flex-col'}`}
        >
            {isCompact ? (
                <Text
                    className={`text-[10px] font-bold truncate ${statusTheme.text}`}
                    numberOfLines={1} // Forces React Native to truncate text with "..." instead of wrapping to a new line
                >
                    {appointment.client?.full_name || 'Cliente'} • {new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            ) : (
                // Normal mode (45+ mins): 3 lines complete design
                <>
                    <Text className={`text-xs font-bold truncate ${statusTheme.text}`} numberOfLines={1}>
                        {appointment.client?.full_name || 'Cliente'}
                    </Text>
                    <Text className={`text-[10px] truncate mt-0.5 opacity-80 ${statusTheme.text}`} numberOfLines={1}>
                        {appointment.service?.name_es || 'Corte'}
                    </Text>

                    <Text className={`text-[10px] font-semibold mt-auto ${statusTheme.text}`} numberOfLines={1}>
                        {new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    )
}