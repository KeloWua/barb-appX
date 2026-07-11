import { useState, useEffect, useMemo } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Touchable, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { format, setSeconds } from 'date-fns'
import { es } from 'date-fns/locale'

import { useBookingStore } from '../../../stores/bookingStore'
import { useHoldDetails } from '../../../hooks/useHoldDetails'
import { updateAppointmentStatus, releaseAppointmentHold } from '../../../lib/repositories/appointmentRepository'

export default function ConfirmScreen() {
    const router = useRouter()
    const {
        selectedService,
        selectedBarber,
        selectedSlotStart,
        selectedSlotEnd,
        holdId,
        clearBooking
    } = useBookingStore()

    const { data: hold, isLoading } = useHoldDetails(holdId)
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
    const [isConfirming, setIsConfirming] = useState(false)

    // Countdown based on real expires_at from DB
    useEffect(() => {
        if (!hold?.expires_at) return

        const tick = () => {
            const diff = new Date(hold.expires_at!).getTime() - Date.now()
            setSecondsLeft(Math.max(0, Math.floor(diff / 1000)))
        }

        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [hold?.expires_at])

    const isExpired = secondsLeft === 0

    const countdownLabel = useMemo(() => {
        if (secondsLeft === null) return null
        const m = Math.floor(secondsLeft / 60)
        const s = secondsLeft % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }, [secondsLeft])

    const handleConfirm = async () => {
        if (!holdId || isExpired) return
        setIsConfirming(true)
        try {
            const { error } = await updateAppointmentStatus(holdId, 'confirmed')
            if (error) throw error
            router.replace({
                pathname: '/(client)/book/success',
                // We send appointment ID to fetch it updated on success screen in case anything changes on DB
                params: { id: holdId },
            })
        } catch {
            Alert.alert('Error', 'No se pudo confirmar la cita. Inténtalo de nuevo.')
        } finally {
            setIsConfirming(false)
        }
    }

    const handleCancel = async () => {
        if (holdId) {
            try {
                await releaseAppointmentHold(holdId)
            } catch {
                // If it expired on the server, nothing happens
            }
        }
        clearBooking()
        router.replace('/book/select-service')
    }

    if (!selectedService || !selectedBarber || !selectedSlotStart || !holdId) {
        return (
            <View className='flex-1 items-center justify-center bg-slate-50'>
                <Text className='text-slate-500'>Faltan datos de la reserva.</Text>
            </View>
        )
    }

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-slate-50'>
                <ActivityIndicator size='large' color='#0f172a' />
            </View>
        )
    }

    return (
        <ScrollView
            showsHorizontalScrollIndicator={false}
            className="flex-1 bg-slate-50"
            contentContainerStyle={{
                padding: 20,
                paddingBottom: 40,
            }}
        >
            <View className='flex-1 bg-slate-50 px-5 pt-12'>
                <Text className='text-lg font-bold text-slate-900 mb-1'>Confirma tu cita</Text>

                {countdownLabel && !isExpired && (
                    <Text className='text-amber-600 font-bold text-sm mb-6'>
                        Reservado por {countdownLabel} min
                    </Text>
                )}

                {isExpired && (
                    <View className='bg-red-50 border border-red-200 rounded-xl p-4 mb-6'>
                        <Text className='text-red-700 font-bold mb-1'>El tiempo de reserva expiró</Text>
                        <Text className='text-red-600 text-sm'>Elige de nuevo un horario disponible.</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/')}
                            className='flex-row justify-between pt-4 border-t border-slate-100'>
                            <Text className='bg-slate-50 p-2 rounded-sm'>Reservar de nuevo</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Resumen */}
                <View className='bg-white border border-slate-200 rounded-2xl p-5 mb-8'>
                    <View className='flex-row justify-between mb-4'>
                        <Text className='text-slate-500'>Servicio</Text>
                        <Text className='text-slate-900 font-bold'>{selectedService.name_es}</Text>
                    </View>
                    <View className='flex-row justify-between mb-4'>
                        <Text className='text-slate-500'>Barber</Text>
                        <Text className='text-slate-900 font-bold'>{selectedBarber.name}</Text>
                    </View>
                    <View className='flex-row justify-between mb-4'>
                        <Text className='text-slate-500'>Fecha</Text>
                        <Text className='text-slate-900 font-bold'>
                            {format(new Date(selectedSlotStart), "d 'de' MMMM", { locale: es })}
                        </Text>
                    </View>
                    <View className='flex-row justify-between mb-4'>
                        <Text className='text-slate-500'>Hora</Text>
                        <Text className='text-slate-900 font-bold'>
                            {format(new Date(selectedSlotStart), 'HH:mm')} - {format(new Date(selectedSlotEnd!), 'HH:mm')}
                        </Text>
                    </View>
                    <View className='flex-row justify-between pt-4 border-t border-slate-100'>
                        <Text className='text-slate-500'>Precio</Text>
                        <Text className='text-slate-900 font-bold text-lg'>{selectedService.price}€</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={isExpired ? () => router.push('/book/select-datetime') : handleConfirm}
                    disabled={isConfirming}
                    className={`rounded-2xl py-4 items-center mb-3 ${isExpired ? 'bg-slate-300' : 'bg-slate-900'}`}
                >
                    <Text className='text-white font-bold text-base'>
                        {isConfirming ? 'Confirmando...' : isExpired ? 'La reserva expiró, elige otro horario' : 'Confirmar cita'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleCancel} className='rounded-2xl bg-slate-100 py-3 items-center'>
                    <Text className='text-slate-500 font-medium'>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}