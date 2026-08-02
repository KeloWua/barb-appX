import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'

import { useBarbers } from '../../../../hooks/useBarbers'
import { WeeklyScheduleEditor } from '../../../../components/schedule/WeeklyScheduleEditor'

export default function AdminBarberScheduleSettings() {
    const router = useRouter()
    const { id } = useLocalSearchParams<{ id: string }>()
    const { data: barbers = [], isLoading } = useBarbers(false)

    const barber = barbers.find((b) => b.id === id)

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#0f172a" />
            </View>
        )
    }

    if (!barber) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 px-5">
                <Text className="text-slate-500 text-center">No se encontró este barbero.</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-slate-50">
            <View className="flex-row items-center px-4 pt-12 pb-4 bg-white border-b border-slate-200">
                <TouchableOpacity onPress={() => router.back()} className="pr-3">
                    <Text className="text-slate-600 font-bold text-lg">‹</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900">Horario de {barber.name}</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}>
                <Text className="text-slate-500 text-sm px-5 mb-2">
                    Editando como administrador. Los cambios se aplican al instante.
                </Text>
                <WeeklyScheduleEditor barberId={barber.id} />
            </ScrollView>
        </View>
    )
}