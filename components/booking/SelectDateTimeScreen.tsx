// components/booking/SelectDateTimeScreen.tsx
import { useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { format, addDays, setHours, setMinutes, isBefore, isEqual } from 'date-fns'
import { es } from 'date-fns/locale'

import { useAuth } from '../../hooks/useAuth'
import { useAppointments } from '../../hooks/useAppointments'
import { useServiceDetails } from '../../hooks/useServiceDetails'
import { useBarberDetails } from '../../hooks/useBarberDetails'
import { useBookingStore } from '../../stores/bookingStore'
import { START_HOUR, END_HOUR } from '../../lib/calendarUtils'

const isSlotAvailable = (slotStart: Date, slotEnd: Date, bookedAppointments: any[]) => {
  return !bookedAppointments.some((apt) => {
    const aptStart = new Date(apt.start_time)
    const aptEnd = new Date(apt.end_time)
    return slotStart < aptEnd && slotEnd > aptStart
  })
}

type Props = { mode: 'client' | 'barber' }

export default function SelectDateTimeScreen({ mode }: Props) {
  const router = useRouter()
  const { profile } = useAuth()
  const {
    serviceId,
    barberId,
    customerId,
    customerName,
    selectedDate,
    setDate,
    setHold,
    holdId,
  } = useBookingStore()

  const { data: selectedService } = useServiceDetails(serviceId)
  const { data: selectedBarber } = useBarberDetails(barberId)

  const activeDate = selectedDate ? new Date(selectedDate) : new Date()

  // En modo barbero el "barbero" del slot suele ser él mismo, pero dejamos
  // el campo por si en el futuro un barbero agenda a nombre de otro.
  const effectiveBarberId = mode === 'barber' ? profile?.id ?? barberId : barberId

  const { appointments, isLoading, holdSlot, releaseHold } = useAppointments(
    activeDate,
    'day',
    effectiveBarberId
  )

  const nextDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i))
  }, [])

  const { morningSlots, afternoonSlots } = useMemo(() => {
    if (!selectedService) return { morningSlots: [], afternoonSlots: [] }

    const morning: Date[] = []
    const afternoon: Date[] = []
    const now = new Date()
    const slotInterval = 30
    const serviceDuration = selectedService.duration_minutes

    let currentSlot = setMinutes(setHours(activeDate, START_HOUR), 0)
    const endOfDay = setMinutes(setHours(activeDate, END_HOUR), 0)

    while (isBefore(currentSlot, endOfDay)) {
      const slotEnd = new Date(currentSlot.getTime() + serviceDuration * 60000)
      const isFuture = currentSlot > now

      if (isFuture && isSlotAvailable(currentSlot, slotEnd, appointments)) {
        if (currentSlot.getHours() < 16) {
          morning.push(currentSlot)
        } else {
          afternoon.push(currentSlot)
        }
      }
      currentSlot = new Date(currentSlot.getTime() + slotInterval * 60000)
    }

    return { morningSlots: morning, afternoonSlots: afternoon }
  }, [activeDate, appointments, selectedService])

  const handleSelectSlot = async (slotStart: Date) => {
    // En modo cliente, el dueño de la cita es el usuario logueado.
    // En modo barbero, ya viene del paso de selección de cliente.
    const ownerId = mode === 'client' ? profile?.id : customerId

    if (!ownerId || !selectedService || !effectiveBarberId) return

    try {
      if (holdId) await releaseHold(holdId)

      const slotEnd = new Date(slotStart.getTime() + selectedService.duration_minutes * 60000)

      const newHoldId = await holdSlot(
        ownerId,
        selectedService.id,
        slotStart.toISOString(),
        slotEnd.toISOString()
      )

      setHold(newHoldId)
      router.push(mode === 'barber' ? '/appointments/confirm' : '/book/confirm')
    } catch (error: any) {
      Alert.alert('Aviso', 'Este hueco acaba de ser reservado por otra persona. Elige otro.')
    }
  }

  if (!selectedService || (mode === 'client' && !selectedBarber) || (mode === 'barber' && !customerId)) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <Text className="text-slate-500">Faltan datos de la reserva.</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-white pt-6 pb-4 border-b border-slate-200">
        <Text className="px-5 text-lg font-bold text-slate-900 mb-1">Elige una fecha</Text>
        {mode === 'barber' && customerName && (
          <Text className="px-5 text-sm text-slate-500 mb-3">Cita para: {customerName}</Text>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
          {nextDays.map((date, i) => {
            const isSelected = selectedDate ? isEqual(new Date(selectedDate), date) : i === 0
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setDate(date.toISOString())}
                className={`mr-3 items-center justify-center py-3 px-5 rounded-2xl border ${
                  isSelected ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`text-xs font-bold uppercase mb-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {format(date, 'eee', { locale: es })}
                </Text>
                <Text className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {format(date, 'd')}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        {isLoading ? (
          <ActivityIndicator size="large" color="#0f172a" className="mt-10" />
        ) : morningSlots.length === 0 && afternoonSlots.length === 0 ? (
          <View className="items-center justify-center mt-10">
            <Text className="text-4xl mb-3">🪑</Text>
            <Text className="text-slate-500 font-medium">No hay huecos disponibles este día.</Text>
          </View>
        ) : (
          <>
            {morningSlots.length > 0 && (
              <View className="mb-8">
                <Text className="text-base font-bold text-slate-800 mb-4">Mañana</Text>
                <View className="flex-row flex-wrap gap-y-3 justify-between">
                  {morningSlots.map((slot, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleSelectSlot(slot)}
                      className="w-[31%] py-3 bg-white border border-slate-200 rounded-xl items-center shadow-sm"
                    >
                      <Text className="text-slate-900 font-bold">{format(slot, 'HH:mm')}</Text>
                    </TouchableOpacity>
                  ))}
                  <View className="w-[31%]" />
                  <View className="w-[31%]" />
                </View>
              </View>
            )}

            {afternoonSlots.length > 0 && (
              <View className="mb-12">
                <Text className="text-base font-bold text-slate-800 mb-4">Tarde (a partir de las 16:00)</Text>
                <View className="flex-row flex-wrap gap-y-3 justify-between">
                  {afternoonSlots.map((slot, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleSelectSlot(slot)}
                      className="w-[31%] py-3 bg-white border border-slate-200 rounded-xl items-center shadow-sm"
                    >
                      <Text className="text-slate-900 font-bold">{format(slot, 'HH:mm')}</Text>
                    </TouchableOpacity>
                  ))}
                  <View className="w-[31%]" />
                  <View className="w-[31%]" />
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}