import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAppointment } from '../../hooks/useMyAppointments'


export default function AppointmentDetails() {
    const { id } = useLocalSearchParams<{ id: string }>()

    const { data: appointment, isLoading } = useAppointment(id)

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator />
            </View>
        )
    }

    if (!appointment) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <Text>Cita no encontrada.</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-slate-50 px-5 pt-8">

            <Text className="text-3xl font-bold text-slate-900 mb-6">
                Detalle de la cita
            </Text>

            <View className="bg-white rounded-2xl border border-slate-200 p-5">

                <Text className="text-xl font-bold mb-5">
                    {appointment.service.name_es}
                </Text>

                <View className="flex-row justify-between mb-4">
                    <Text className="text-slate-500">Barbero</Text>
                    <Text>{appointment.barber.name}</Text>
                </View>

                <View className="flex-row justify-between mb-4">
                    <Text className="text-slate-500">Fecha</Text>
                    <Text>
                        {format(
                            new Date(appointment.start_time),
                            "EEEE d 'de' MMMM",
                            { locale: es }
                        )}
                    </Text>
                </View>

                <View className="flex-row justify-between mb-4">
                    <Text className="text-slate-500">Hora</Text>
                    <Text>
                        {format(new Date(appointment.start_time), 'HH:mm')} -{' '}
                        {format(new Date(appointment.end_time), 'HH:mm')}
                    </Text>
                </View>

                <View className="flex-row justify-between">
                    <Text className="text-slate-500">Precio</Text>
                    <Text>{appointment.service.price} €</Text>
                </View>

            </View>

            <TouchableOpacity
                className="bg-slate-900 rounded-2xl py-4 items-center mt-8"
            >
                <Text className="text-white font-bold">
                    Añadir al calendario
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="bg-red-600 rounded-2xl py-4 items-center mt-3"
            >
                <Text className="text-white font-bold">
                    Cancelar cita
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="bg-slate-200 rounded-2xl py-4 items-center mt-3"
            >
                <Text className="font-semibold">
                    Compartir cita
                </Text>
            </TouchableOpacity>

        </View>
    )
}