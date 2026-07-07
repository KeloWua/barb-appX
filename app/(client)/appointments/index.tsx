import { View, Text, ActivityIndicator, ScrollView } from 'react-native'
import { useMemo } from 'react'
import { useMyAppointments } from '../../../hooks/useMyAppointments'
import AppointmentCard from '../../../components/appointments/AppointmentCard'
import HomeButton from '../../../components/buttons/HomeButton'

export default function MyAppointmentsScreen() {
    const { data: appointments = [], isLoading } = useMyAppointments()

    const now = new Date()

    const { upcoming, history } = useMemo(() => {
        return {
            upcoming: appointments.filter(
                (a) =>
                    a.status === 'confirmed' &&
                    new Date(a.start_time) >= now
            ),

            history: appointments.filter(
                (a) =>
                    a.status === 'completed' ||
                    a.status === 'no_show' ||
                    (a.status === 'confirmed' &&
                        new Date(a.start_time) < now)
            ),
        }
    }, [appointments])

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#0f172a" />
            </View>
        )
    }

    if (!appointments.length) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 px-6">
                <Text className="text-5xl mb-5">📅</Text>

                <Text className="text-xl font-bold text-slate-900">
                    No tienes citas
                </Text>

                <Text className="text-slate-500 text-center mt-2">
                    Cuando reserves una cita aparecerá aquí.
                </Text>
            </View>
        )
    }
    
    return (
        <ScrollView
            className="flex-1 bg-slate-50"
            contentContainerStyle={{
                padding: 20,
                paddingBottom: 40,
            }}
        >
            
            <Text className="text-3xl font-bold text-slate-900 mb-6">
                Mis citas
            </Text>

            <Text className="text-lg font-semibold text-slate-900 mb-4">
                Próximas
            </Text>

            {upcoming.length ? (
                upcoming.map((appointment) => (
                    <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                    />
                ))
            ) : (
                <Text className="text-slate-500 mb-8">
                    No tienes próximas citas.
                </Text>
            )}

            <Text className="text-lg font-semibold text-slate-900 mt-2 mb-4">
                Historial
            </Text>

            {history.length ? (
                history.map((appointment) => (
                    <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                    />
                ))
            ) : (
                <Text className="text-slate-500">
                    No hay citas anteriores.
                </Text>
            )}
        </ScrollView>
    )
}