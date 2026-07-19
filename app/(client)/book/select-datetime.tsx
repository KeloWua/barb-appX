import { useEffect, useMemo, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { useRouter } from 'expo-router'
import {
    format, addDays, isSameDay, startOfDay, startOfWeek
} from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '../../../hooks/useAuth'
import { useAppointments } from '../../../hooks/useAppointments'
import { useBookingStore } from '../../../stores/bookingStore'
import { useBookedSlots } from '../../../hooks/useBookedSlots'
import { calculateAvailableSlots } from '../../../lib/calendarUtils'

// Language configuration for react-native-calendars, will be managed by i18n in future
LocaleConfig.locales['es'] = {
    monthNames: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';



export default function SelectDateTimeScreen() {
    const router = useRouter()
    const { profile } = useAuth()
    const {
        selectedService,
        selectedBarber,
        selectedDate,
        setDate,
        setHold,
        setSlot,
        holdId
    } = useBookingStore()

    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false)

    // Default to today if no date is selected
    const activeDate = selectedDate ? new Date(selectedDate) : new Date()

    // Smart logic: If activeDate is from another week (more than 6 days away frm today),
    // we make te horizontal strip start on that WEEK(Mon-Sun) so it is visible
    const stripStartDate = useMemo(() => {
        return startOfWeek(activeDate, { weekStartsOn: 1 })
    }, [activeDate])

    // Generate 7-day horizontal strip
    const nextDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(stripStartDate, i))
    }, [stripStartDate])

    // Fetch real-time appointments
    const { appointments, isLoading, holdSlot, releaseHold } = useAppointments(
        activeDate,
        'day',
        selectedBarber?.id
    )

    // Booked hours
    const { data: bookedSlots, isLoading: isLoadingBooked } = useBookedSlots(
        selectedBarber?.id,
        format(activeDate, 'yyyy-MM-dd'),
        format(activeDate, 'yyyy-MM-dd')
    )

    // Generate available slots
    const { morningSlots, afternoonSlots } = useMemo(() => {
        if (!selectedService || !bookedSlots) return { morningSlots: [], afternoonSlots: [] }

        return calculateAvailableSlots(
            activeDate,
            selectedService.duration_minutes,
            bookedSlots
        )
    }, [activeDate, bookedSlots, selectedService])

    // Handle slot selection
    const handleSelectSlot = async (slotStart: Date) => {
        if (!profile?.id || !selectedService || !selectedBarber) return

        try {
            if (holdId) await releaseHold(holdId)

            const slotEnd = new Date(slotStart.getTime() + selectedService.duration_minutes * 60000)

            const newHoldId = await holdSlot(
                profile.id,
                selectedService.id,
                slotStart.toISOString(),
                slotEnd.toISOString()
            )
            setHold(newHoldId)
            setSlot(slotStart.toISOString(), slotEnd.toISOString())
            router.push('/book/confirm')
        } catch (error: any) {
            if (error.message === 'SLOT_TAKEN') {
                Alert.alert('Hueco ocupado', 'Alguien acaba de reservar esta hora. Elige otra.')
            } else {
                Alert.alert('Error', 'No se pudo completar la reserva. Inténtalo de nuevo.')
            }
        }
    }

    useEffect(() => {
        return () => { }
    }, [])

    if (!selectedService || !selectedBarber) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <Text className="text-slate-500">Faltan datos de la reserva.</Text>
            </View>
        )
    }

    return (
        <View className='flex-1 bg-slate-50'>
            {/* DATE SELECTOR (Header + Horizontal Strip) */}
            <View className='bg-white pt-6 pb-4 border-b border-slate-200 px-5'>

                <View className='flex-row justify-between items-center mb-4'>
                    <View>
                        <Text className='text-lg font-bold text-slate-900'>
                            {format(activeDate, "MMMM yyyy", { locale: es }).replace(/^\w/, (c) => c.toUpperCase())}
                        </Text>
                        <Text className='text-slate-500 text-sm mt-1'>
                            Con {selectedBarber.name}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={() => router.push('/book/select-barber')}>
                        <Text className='text-slate-900 font-bold text-sm underline'>
                            Cambiar barbero
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Horizontal date strip + Calendar Button */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {nextDays.map((date, i) => {
                        const isSelected = isSameDay(activeDate, date)
                        const isPast = startOfDay(date) < startOfDay(new Date())

                        return (
                            <TouchableOpacity
                                key={i}
                                onPress={() => setDate(date.toISOString())}
                                disabled={isPast}
                                className={`mr-3 items-center justify-center py-3 px-5 rounded-2xl border ${isSelected
                                    ? 'bg-slate-900 border-slate-900'
                                    : isPast
                                        ? 'bg-slate-50 border-slate-100 opacity-50' // Dimmed effect for past days
                                        : 'bg-white border-slate-200'
                                    }`}
                            >
                                <Text className={`text-xs font-bold uppercase mb-1 ${isSelected
                                    ? 'text-slate-300'
                                    : isPast
                                        ? 'text-slate-400'
                                        : 'text-slate-500'
                                    }`}>
                                    {format(date, 'eee', { locale: es })}
                                </Text>

                                <Text className={`text-xl font-bold ${isSelected
                                    ? 'text-white'
                                    : isPast
                                        ? 'text-slate-300'
                                        : 'text-slate-900'
                                    }`}>
                                    {format(date, 'd')}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}


                    {/* FULL CALENDAR BUTTON (At the end of the strip) */}
                    <TouchableOpacity
                        onPress={() => setIsDatePickerVisible(true)}
                        className='mr-5 items-center justify-center py-3 px-5 rounded-2xl border border-slate-200 bg-white'
                    >
                        <Text className='text-xl mb-1'>📅</Text>
                        <Text className='text-[10px] font-bold uppercase text-slate-500'>
                            Más fechas
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Native Calendar Modal (Hidden by default) */}
            {/* Modal Universal de Calendario (Web, iOS, Android) */}
            <Modal
                visible={isDatePickerVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsDatePickerVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-5">
                    <View className="bg-white rounded-3xl overflow-hidden w-full max-w-md pb-4 shadow-xl">
                        <Calendar
                            // Starts on Monday rather than Sunday
                            firstDay={1}
                            // Doesn't allow to book in the past
                            minDate={new Date().toISOString().split('T')[0]}
                            // Actual selected date
                            current={activeDate.toISOString().split('T')[0]}
                            onDayPress={(day: any) => {
                                setDate(new Date(day.timestamp).toISOString())
                                setIsDatePickerVisible(false)
                            }}
                            theme={{
                                todayTextColor: '#0f172a', // slate-900
                                arrowColor: '#0f172a',
                                selectedDayBackgroundColor: '#0f172a',
                                textDayFontWeight: '500',
                                textMonthFontWeight: 'bold',
                            }}
                        />

                        <View className="px-5 mt-2">
                            <TouchableOpacity
                                onPress={() => setIsDatePickerVisible(false)}
                                className="py-3 items-center rounded-xl bg-slate-100"
                            >
                                <Text className="font-bold text-slate-700">Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* AVAILABLE TIME SLOTS */}
            <ScrollView className='flex-1 px-5 pt-6'>
                {(isLoading || isLoadingBooked) ? (
                    <ActivityIndicator size='large' color='#0f172a' className='mt-10' />
                ) : morningSlots.length === 0 && afternoonSlots.length === 0 ? (
                    <View className='items-center justify-center mt-10'>
                        <Text className='text-4xl mb-3'>🪑</Text>
                        <Text className='text-slate-500 font-medium mb-4'>
                            No hay huecos disponibles este día
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* MORNING SECTION */}
                        {morningSlots.length > 0 && (
                            <View className='mb-8'>
                                <Text className='text-base font-bold text-slate-800 mb-4'>Mañana</Text>
                                <View className='flex-row flex-wrap gap-y-3 justify-between'>
                                    {morningSlots.map((slot, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            onPress={() => handleSelectSlot(slot)}
                                            className='w-[31%] py-3 bg-white border border-slate-200 rounded-xl items-center shadow-sm'
                                        >
                                            <Text className='text-slate-900 font-bold'>
                                                {format(slot, 'HH:mm')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    <View className='w-[31%]' /><View className='w-[31%]' />
                                </View>
                            </View>
                        )}

                        {/* AFTERNOON SECTION */}
                        {afternoonSlots.length > 0 && (
                            <View className='mb-12'>
                                <Text className='text-base font-bold text-slate-800 mb-4'>Tarde</Text>
                                <View className='flex-row flex-wrap gap-y-3 justify-between'>
                                    {afternoonSlots.map((slot, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            onPress={() => handleSelectSlot(slot)}
                                            className='w-[31%] py-3 bg-white border border-slate-200 rounded-xl items-center shadow-sm'
                                        >
                                            <Text className='text-slate-900 font-bold'>
                                                {format(slot, 'HH:mm')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    <View className='w-[31%]' /><View className='w-[31%]' />
                                </View>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    )
}