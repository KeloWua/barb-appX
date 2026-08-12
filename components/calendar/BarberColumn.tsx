import { View, Text, TouchableOpacity } from 'react-native'
import { AppointmentBlock } from './AppointmentBlock'
import { COLUMN_WIDTH, getDayTotalHeight, generateDaySlots, calculateTop, PX_PER_MINUTE } from '../../lib/calendarUtils'
import { AppointmentWithRelations } from '../../types/app'

interface Props {
    barberName: string
    appointments: AppointmentWithRelations[]
    date: Date
    startHour: number
    endHour: number
    timezone: string
    onPressAppointment: (appointment: AppointmentWithRelations) => void
    onPressEmptySlot: (slotStart: Date) => void
}

export function BarberColumn({ barberName, appointments, date, startHour, endHour, timezone, onPressAppointment, onPressEmptySlot }: Props) {
    const height = getDayTotalHeight(startHour, endHour)
    const slots = generateDaySlots(date, startHour, endHour, timezone)
    const slotHeight = 30 * PX_PER_MINUTE

    const isSlotOccupied = (slotStart: Date) => {
        const slotEnd = new Date(slotStart.getTime() + 30 * 60000)
        return appointments.some((apt) => {
            const aptStart = new Date(apt.start_time)
            const aptEnd = new Date(apt.end_time)
            return slotStart < aptEnd && slotEnd > aptStart
        })
    }

    return (
        <View style={{ width: COLUMN_WIDTH }} className="border-r border-slate-200">
            <View className="bg-slate-50 h-[48px] border-b border-slate-200 items-center justify-center">
                <Text className="font-bold text-slate-800">{barberName}</Text>
            </View>

            <View style={{ height }} className="relative bg-transparent">
                {/* Empty clickable slots - they render FIRST */}
                {slots.map((slot, i) => {
                    if (isSlotOccupied(slot)) return null
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => onPressEmptySlot(slot)}
                            style={{ top: calculateTop(slot.toISOString(), startHour, timezone), height: slotHeight }}
                            className="absolute left-1 right-1 rounded-md active:bg-slate-200"
                        />
                    )
                })}

                {appointments.map((apt) => (
                    <AppointmentBlock
                        key={apt.id}
                        appointment={apt}
                        startHour={startHour}
                        timezone={timezone}
                        onPress={() => onPressAppointment(apt)}
                    />
                ))}
            </View>
        </View>
    )
}