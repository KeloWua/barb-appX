import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import type { AppointmentWithRelations } from '../../types/app'

interface Props {
    appointment: AppointmentWithRelations
}

const statusStyle = {
    confirmed: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
    },
    completed: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
    },
    cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
    },
    holding: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
    },
    no_show: {
        bg: 'bg-slate-200',
        text: 'text-slate-700',
    },
}

const statusLabels = {
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    holding: 'Pendiente',
    no_show: 'No asistió',
}

export default function AppointmentCard({ appointment }: Props) {
    const router = useRouter()

    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => router.push(`/appointments/${appointment.id}`)}
                className="bg-white border border-slate-200 rounded-2xl p-5 mb-4"
            >

                <View className="flex-row justify-between items-start">

                    <View className="flex-1">

                        <Text className="text-lg font-bold text-slate-900">
                            {appointment.service.name_es}
                        </Text>

                        <Text className="text-slate-500 mt-1">
                            Con {appointment.barber.name}
                        </Text>

                    </View>

                    <View className={`px-3 py-1 rounded-full ${statusStyle[appointment.status].bg}`}>
                        <Text className={`text-xs font-semibold ${statusStyle[appointment.status].text}`}>
                            {statusLabels[appointment.status]}
                        </Text>
                    </View>

                </View>

                <View className="border-t border-slate-100 mt-5 pt-5">

                    <View className="flex-row justify-between mb-3">
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

                    <View className="flex-row justify-between mb-3">
                        <Text className="text-slate-500">
                            Hora
                        </Text>

                        <Text className="font-semibold text-slate-900">
                            {format(new Date(appointment.start_time), 'HH:mm')} -{' '}
                            {format(new Date(appointment.end_time), 'HH:mm')}
                        </Text>
                    </View>

                    <View className="flex-row justify-between">
                        <Text className="text-slate-500">
                            Precio
                        </Text>

                        <Text className="font-bold text-slate-900">
                            {appointment.service.price}€
                        </Text>
                    </View>

                </View>

            </TouchableOpacity>
        </View>
    )
}