import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEffect } from 'react'

import { useBookingStore } from '../../../stores/bookingStore'
import { useShareAppointment } from '../../../hooks/useShareAppointment'
import { useAddToCalendar } from '../../../hooks/useAddToCalendar'
import { useAppointment } from '../../../hooks/useMyAppointments'

export default function SuccessScreen() {
    const router = useRouter()

    const { shareAppointment } = useShareAppointment()
    const { addToCalendar } = useAddToCalendar()

    const { clearBooking } = useBookingStore()

    const { id } = useLocalSearchParams<{ id: string }>()
    const { data: appointment, isLoading } = useAppointment(id)

    useEffect(() => {
        if (!isLoading && !appointment) {
            router.replace('/(client)')
        }
    }, [isLoading, appointment, router])

    if (isLoading) {
        return null
    }

    if (!appointment) {
        return null
    }

    const goToAppointments = () => {
        router.replace('/appointments')
    }

    const goHome = () => {
        clearBooking()
        router.replace('/')
    }



    const handleShare = () => shareAppointment(appointment)

    const handleAddToCalendar = () => addToCalendar(appointment)

    return (
        <ScrollView
            showsHorizontalScrollIndicator={false}
            className="flex-1 bg-slate-50"
            contentContainerStyle={{
                padding: 20,
                paddingBottom: 40,
            }}
        >
            <View className="flex-1 bg-slate-50 px-6 justify-center">

                <View className="bg-white rounded-3xl p-6 border border-slate-200">

                    <Text className="text-6xl text-center mb-4">
                        ✅
                    </Text>

                    <Text className="text-2xl font-bold text-slate-900 text-center">
                        ¡Cita confirmada!
                    </Text>

                    <Text className="text-slate-500 text-center mt-2 mb-8">
                        Tu reserva se ha realizado correctamente.
                    </Text>

                    <View className="border-t border-slate-200 pt-5">

                        <View className="flex-row justify-between mb-4">
                            <Text className="text-slate-500">
                                Servicio
                            </Text>

                            <Text className="font-semibold text-slate-900">
                                {appointment.service.name_es}
                            </Text>
                        </View>

                        <View className="flex-row justify-between mb-4">
                            <Text className="text-slate-500">
                                Barbero
                            </Text>

                            <Text className="font-semibold text-slate-900">
                                {appointment.barber.name}
                            </Text>
                        </View>

                        <View className="flex-row justify-between mb-4">
                            <Text className="text-slate-500">
                                Fecha
                            </Text>

                            <Text className="font-semibold text-slate-900">
                                {format(
                                    new Date(appointment.start_time),
                                    "EEEE d 'de' MMMM",
                                    { locale: es }
                                )}
                            </Text>
                        </View>

                        <View className="flex-row justify-between mb-4">
                            <Text className="text-slate-500">
                                Hora
                            </Text>

                            <Text className="font-semibold text-slate-900">
                                {format(new Date(appointment.start_time), 'HH:mm')} -{' '}
                                {format(new Date(appointment.end_time
                                ), 'HH:mm')}
                            </Text>
                        </View>

                        <View className="flex-row justify-between pt-4 border-t border-slate-200">
                            <Text className="text-slate-500">
                                Precio
                            </Text>

                            <Text className="text-lg font-bold text-slate-900">
                                {appointment.service.price}€
                            </Text>
                        </View>

                    </View>

                </View>

                <TouchableOpacity
                    onPress={handleAddToCalendar}
                    className="bg-blue-900 rounded-2xl py-4 items-center mb-3"
                >
                    <Text className="text-white font-bold">Añadir al calendario</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleShare}
                    className="bg-slate-300 rounded-2xl py-4 items-center mb-3"
                >
                    <Text className="font-bold text-slate-900">
                        Compartir
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={goToAppointments}
                    className="bg-slate-900 rounded-2xl py-4 items-center mb-3"
                >
                    <Text className="text-white font-bold text-base">
                        Ver mis citas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={goHome}
                    className="bg-gray-300 border border-slate-300 rounded-2xl py-4 items-center mb-3"
                >
                    <Text className="text-slate-700 font-semibold">
                        Volver al inicio
                    </Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
    )
}