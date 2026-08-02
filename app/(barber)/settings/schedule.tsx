import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

import { useAuth } from '../../../hooks/useAuth'
import { useBarbers } from '../../../hooks/useBarbers'
import { WeeklyScheduleEditor } from '../../../components/schedule/WeeklyScheduleEditor'

export default function BarberScheduleSettings() {
    const router = useRouter()
    const { profile } = useAuth()
    // false = includes the 'Extras' dummy barber, doesn't matter here — we filter by profile_id anyway
    const { data: barbers = [], isLoading } = useBarbers(false)

    const myBarber = barbers.find((b) => b.profile_id === profile?.id)

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#0f172a" />
            </View>
        )
    }

    if (!myBarber) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 px-5">
                <Text className="text-slate-500 text-center">
                    No encontramos tu perfil de barbero. Contacta con el administrador.
                </Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-slate-50">
            <View className="flex-row items-center px-4 pt-12 pb-4 bg-white border-b border-slate-200">
                <TouchableOpacity onPress={() => router.back()} className="pr-3">
                    <Text className="text-slate-600 font-bold text-lg">‹</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900">Mi horario</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}>
                <Text className="text-slate-500 text-sm px-5 mb-2">
                    Toca una hora para cambiarla. Añade varias franjas si trabajas en turnos partidos,
                    o marca un tramo como "Descanso" para bloquearlo (comida, pausas, etc).
                </Text>
                <WeeklyScheduleEditor barberId={myBarber.id} />
            </ScrollView>
        </View>
    )
}