import { ActivityIndicator, Text, TouchableOpacity, View, Alert, Platform, Share, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAppointment } from '../../hooks/useMyAppointments'
import { useCancelAppointment } from '../../hooks/useCancelAppointment'
import { useAddToCalendar } from '../../hooks/useAddToCalendar'
import { useShareAppointment } from '../../hooks/useShareAppointment'

export default function AppointmentDetails() {
    const router = useRouter()
    const { id } = useLocalSearchParams<{ id: string }>()

    const { data: appointment, isLoading } = useAppointment(id)
    const { mutate: cancelAppointment, isPending: isCancelling } = useCancelAppointment(id)

    const { addToCalendar } = useAddToCalendar()
    const { shareAppointment } = useShareAppointment()

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#0f172a" />
            </View>
        )
    }

    if (!appointment) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 px-5">
                <Text className="text-slate-500">
                    No se encontró la cita.
                </Text>
            </View>
        )
    }

    const canCancel =
        appointment.status === 'confirmed' &&
        new Date(appointment.start_time).getTime() > Date.now() + 2 * 60 * 60 * 1000


    const cancelDeadline = new Date(
        new Date(appointment.start_time).getTime() - 2 * 60 * 60 * 1000
    )

    const handleShare = () => shareAppointment(appointment)
    
    const handleAddToCalendar = () => addToCalendar(appointment)

    const handleCancelPress = () => {
        const doCancel = () => {
            cancelAppointment(undefined, {
                onError: () => {
                    if (Platform.OS === 'web') {
                        window.alert('No se pudo cancelar. Puede que ya no esté dentro del plazo permitido. Llámanos por teléfono si es urgente.')
                    } else {
                        Alert.alert(
                            'No se pudo cancelar',
                            'Puede que ya no esté dentro del plazo permitido. Llámanos por teléfono si es urgente.'
                        )
                    }
                },
            })
        }

        if (Platform.OS === 'web') {
            const confirmed = window.confirm('¿Seguro que quieres cancelar esta cita?')
            if (confirmed) doCancel()
        } else {
            Alert.alert(
                'Cancelar cita',
                '¿Seguro que quieres cancelar esta cita?',
                [
                    { text: 'No', style: 'cancel' },
                    { text: 'Sí, cancelar', style: 'destructive', onPress: doCancel },
                ]
            )
        }
    }




    return (
        <ScrollView
            className="flex-1 bg-slate-50"
            contentContainerStyle={{
                padding: 20,
                paddingBottom: 40,
            }}
        >
            <View className="flex-1 bg-slate-50 px-5 pt-12">

                <Text className="text-2xl font-bold text-slate-900 mb-6">
                    Detalle de la cita
                </Text>

                <View className="bg-white border border-slate-200 rounded-2xl p-5 mb-8">

                    <View className="flex-row justify-between mb-4">
                        <Text className="text-slate-500">Servicio</Text>
                        <Text className="font-bold text-slate-900">
                            {appointment.service.name_es}
                        </Text>
                    </View>

                    <View className="flex-row justify-between mb-4">
                        <Text className="text-slate-500">Barbero</Text>
                        <Text className="font-bold text-slate-900">
                            {appointment.barber.name}
                        </Text>
                    </View>

                    <View className="flex-row justify-between mb-4">
                        <Text className="text-slate-500">Fecha</Text>
                        <Text className="font-bold text-slate-900">
                            {format(
                                new Date(appointment.start_time),
                                "EEEE d 'de' MMMM yyyy",
                                { locale: es }
                            )}
                        </Text>
                    </View>

                    <View className="flex-row justify-between mb-4">
                        <Text className="text-slate-500">Hora</Text>
                        <Text className="font-bold text-slate-900">
                            {format(new Date(appointment.start_time), 'HH:mm')} -{' '}
                            {format(new Date(appointment.end_time), 'HH:mm')}
                        </Text>
                    </View>

                    <View className="flex-row justify-between mb-4">
                        <Text className="text-slate-500">Precio</Text>
                        <Text className="font-bold text-slate-900">
                            {appointment.service.price}€
                        </Text>
                    </View>

                    <View className="flex-row justify-between pt-4 border-t border-slate-200">
                        <Text className="text-slate-500">Estado</Text>

                        <View
                            className={`px-3 py-1 rounded-full ${appointment.status === 'confirmed'
                                ? 'bg-green-100'
                                : appointment.status === 'cancelled'
                                    ? 'bg-red-100'
                                    : 'bg-amber-100'
                                }`}
                        >
                            <Text
                                className={`font-semibold ${appointment.status === 'confirmed'
                                    ? 'text-green-700'
                                    : appointment.status === 'cancelled'
                                        ? 'text-red-700'
                                        : 'text-amber-700'
                                    }`}
                            >
                                {appointment.status}
                            </Text>
                        </View>
                    </View>

                </View>

                <TouchableOpacity
                    onPress={handleAddToCalendar}
                    className="bg-blue-600 rounded-2xl py-4 items-center mb-3"
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

                {appointment.status === 'confirmed' && (
                    <TouchableOpacity
                        onPress={canCancel ? handleCancelPress : undefined}
                        disabled={!canCancel || isCancelling}
                        className={`rounded-2xl py-4 items-center mb-3 ${canCancel ? 'bg-red-600' : 'bg-slate-300'
                            }`}
                    >
                        <Text className="text-white font-bold">
                            {isCancelling
                                ? 'Cancelando...'
                                : canCancel
                                    ? 'Cancelar cita'
                                    : `Puedes cancelar hasta las ${format(cancelDeadline, 'HH:mm')}`}
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={() => router.push('/book/select-service')}
                    className="bg-white border border-slate-300 rounded-2xl py-4 items-center"
                >
                    <Text className="font-bold text-slate-900">
                        Reservar otra cita
                    </Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
    )
}