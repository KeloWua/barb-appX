import { useState, useMemo, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { format, addDays, setHours, setMinutes, isBefore, isEqual } from 'date-fns'
import { es } from 'date-fns/locale'

import { useAuth } from '../../../hooks/useAuth'
import { useAppointments } from '../../../hooks/useAppointments'
import { useBookingStore } from '../../../stores/bookingStore' // Adjust path if needed
import { START_HOUR, END_HOUR } from '../../../lib/calendarUtils'

// Helper to check if a slot overlaps with any booked appointment
const isSlotAvailable = (slotStart: Date, slotEnd: Date, bookedAppointments: any[]) => {
    return !bookedAppointments.some(apt => {
        const aptStart = new Date(apt.start_time)
        const aptEnd = new Date(apt.end_time)
        // A slot overlaps if it starts before the appointment ends AND ends after the appointment starts
        return slotStart < aptEnd && slotEnd > aptStart
    })
}

export default function SelectDateTimeScreen() {
    const router = useRouter()
    const { profile } = useAuth()
    const { 
        selectedService, 
        selectedBarber, 
        selectedDate, 
        setDate, 
        setHold,
        holdId 
    } = useBookingStore()

    // Default to today if no date is selected
    const activeDate = selectedDate ? new Date(selectedDate) : new Date()

    // 1. Fetch real-time appointments for the selected date and barber
    const { appointments, isLoading, holdSlot, releaseHold } = useAppointments(
        activeDate, 
        'day', 
        selectedBarber?.id
    )

    // 2. Generate Next 7 Days for the top selector
    const nextDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i))
    }, [])

    // 3. Generate Available Slots mathematically
    const { morningSlots, afternoonSlots } = useMemo(() => {
        if (!selectedService) return { morningSlots: [], afternoonSlots: [] }

        const morning: Date[] = []
        const afternoon: Date[] = []
        const now = new Date()

        // We assume slots are generated every 30 minutes, or you can use service.duration_minutes
        const slotInterval = 30 
        const serviceDuration = selectedService.duration_minutes

        let currentSlot = setMinutes(setHours(activeDate, START_HOUR), 0)
        const endOfDay = setMinutes(setHours(activeDate, END_HOUR), 0)

        while (isBefore(currentSlot, endOfDay)) {
            const slotEnd = new Date(currentSlot.getTime() + serviceDuration * 60000)

            // Ensure the slot hasn't already passed (if booking for today)
            const isFuture = currentSlot > now

            if (isFuture && isSlotAvailable(currentSlot, slotEnd, appointments)) {
                if (currentSlot.getHours() < 16) {
                    morning.push(currentSlot)
                } else {
                    afternoon.push(currentSlot)
                }
            }

            // Move to next 30-min block
            currentSlot = new Date(currentSlot.getTime() + slotInterval * 60000)
        }

        return { morningSlots: morning, afternoonSlots: afternoon }
    }, [activeDate, appointments, selectedService])

    // 4. Handle Slot Selection (The Hold mechanism)
    const handleSelectSlot = async (slotStart: Date) => {
        if (!profile?.id || !selectedService || !selectedBarber) return

        try {
            // If the user already held a slot but changed their mind, release the old one
            if (holdId) {
                await releaseHold(holdId)
            }

            const slotEnd = new Date(slotStart.getTime() + selectedService.duration_minutes * 60000)
            
            // Lock the slot in the database for 2 minutes
            const newHoldId = await holdSlot(
                profile.id,
                selectedService.id,
                slotStart.toISOString(),
                slotEnd.toISOString()
            )

            // Save hold to Zustand and navigate to confirmation screen
            setHold(newHoldId)
            router.push('/book/confirm')

        } catch (error: any) {
            Alert.alert('Aviso', 'Este hueco acaba de ser reservado por otra persona. Elige otro.')
        }
    }

    // Optional: Cleanup hold if user leaves this screen completely by going back to home
    useEffect(() => {
        return () => {
            // NOTE: We don't release here if they navigate FORWARD to confirm.
            // You should handle 'releaseHold' explicitly in your header back button if needed.
        }
    }, [])

    if (!selectedService || !selectedBarber) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <Text className="text-slate-500">Faltan datos de la reserva.</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* DATE SELECTOR (Horizontal Strip) */}
            <View className="bg-white pt-6 pb-4 border-b border-slate-200">
                <Text className="px-5 text-lg font-bold text-slate-900 mb-4">Elige una fecha</Text>
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

            {/* SLOTS GRID */}
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
                        {/* MORNING SECTION */}
                        {morningSlots.length > 0 && (
                            <View className="mb-8">
                                <Text className="text-base font-bold text-slate-800 mb-4">Mañana</Text>
                                {/* Grid container: wrapping with a 2% gap trick to fit 3 per row */}
                                <View className="flex-row flex-wrap gap-y-3 justify-between">
                                    {morningSlots.map((slot, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            onPress={() => handleSelectSlot(slot)}
                                            className="w-[31%] py-3 bg-white border border-slate-200 rounded-xl items-center shadow-sm"
                                        >
                                            <Text className="text-slate-900 font-bold">
                                                {format(slot, 'HH:mm')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    {/* Empty views to fix flex-wrap alignment if last row isn't full */}
                                    <View className="w-[31%]" />
                                    <View className="w-[31%]" />
                                </View>
                            </View>
                        )}

                        {/* AFTERNOON SECTION */}
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
                                            <Text className="text-slate-900 font-bold">
                                                {format(slot, 'HH:mm')}
                                            </Text>
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