import { View, Text } from 'react-native';
import { AppointmentBlock } from './AppointmentBlock';
import { COLUMN_WIDTH, getDayTotalHeight } from '../../lib/calendarUtils';

interface Props {
    barberName: string;
    appointments: any[];
    onPressAppointment: (appointment: any) => void; // NUEVO
}

export function BarberColumn({ barberName, appointments, onPressAppointment }: Props) {
    const height = getDayTotalHeight();

    return (
        <View style={{ width: COLUMN_WIDTH }} className="border-r border-slate-200">
            <View className="bg-slate-50 h-[48px] border-b border-slate-200 items-center justify-center">
                <Text className="font-bold text-slate-800">{barberName}</Text>
            </View>

            <View style={{ height }} className="relative bg-transparent">
                {appointments.map((apt) => (
                    <AppointmentBlock
                        key={apt.id}
                        appointment={apt}
                        onPress={() => onPressAppointment(apt)} // PASAMOS EL EVENTO
                    />
                ))}
            </View>
        </View>
    );
}