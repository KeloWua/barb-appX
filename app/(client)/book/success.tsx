import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEffect } from 'react'

import { useBookingStore } from '../../../stores/bookingStore'

export default function SuccessScreen() {
    const router = useRouter()

    const {
        selectedService,
        selectedBarber,
        selectedSlotStart,
        selectedSlotEnd,
        clearBooking,
    } = useBookingStore()

    useEffect(() => {
        if (
            !selectedService ||
            !selectedBarber ||
            !selectedSlotStart ||
            !selectedSlotEnd
        ) {
            router.replace('/(client)')
        }
    }, [
        selectedService,
        selectedBarber,
        selectedSlotStart,
        selectedSlotEnd
    ])

    if (
        !selectedService ||
        !selectedBarber ||
        !selectedSlotStart ||
        !selectedSlotEnd
    ) {
        return null
    }

    const goToAppointments = () => {
        router.replace('/../appointments')
    }

    const goHome = () => {
        clearBooking()
        router.replace('/')
    }

    return (
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
                            {selectedService.name_es}
                        </Text>
                    </View>

                    <View className="flex-row justify-between mb-4">
                        <Text className="text-slate-500">
                            Barbero
                        </Text>

                        <Text className="font-semibold text-slate-900">
                            {selectedBarber.name}
                        </Text>
                    </View>

                    <View className="flex-row justify-between mb-4">
                        <Text className="text-slate-500">
                            Fecha
                        </Text>

                        <Text className="font-semibold text-slate-900">
                            {format(
                                new Date(selectedSlotStart),
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
                            {format(new Date(selectedSlotStart), 'HH:mm')} -{' '}
                            {format(new Date(selectedSlotEnd), 'HH:mm')}
                        </Text>
                    </View>

                    <View className="flex-row justify-between pt-4 border-t border-slate-200">
                        <Text className="text-slate-500">
                            Precio
                        </Text>

                        <Text className="text-lg font-bold text-slate-900">
                            {selectedService.price}€
                        </Text>
                    </View>

                </View>

            </View>

            <TouchableOpacity
                onPress={goToAppointments}
                className="bg-slate-900 rounded-2xl py-4 items-center mt-8"
            >
                <Text className="text-white font-bold text-base">
                    Ver mis citas
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={goHome}
                className="bg-slate-200 rounded-2xl py-4 items-center mt-3"
            >
                <Text className="text-slate-700 font-semibold">
                    Volver al inicio
                </Text>
            </TouchableOpacity>

        </View>
    )
}