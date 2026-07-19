import { setHours, setMinutes, setSeconds, setMilliseconds, addMinutes, isBefore, differenceInMinutes, getHours, getMinutes } from 'date-fns'


export const START_HOUR = 9 // 9:00
export const END_HOUR = 21 // 21:00
export const PX_PER_MINUTE = 1.5 // Visual scale ( 1 hour = 90px )
export const COLUMN_WIDTH = 180 // Fixed width of each barber

export const getDayTotalMinutes = () => (END_HOUR - START_HOUR) * 60
export const getDayTotalHeight = () => getDayTotalMinutes() * PX_PER_MINUTE

// Converts one hour (ISO string) in 'top' (Y) position
export const calculateTop = (startTime: string): number => {
    const date = new Date(startTime)
    const hours = getHours(date)
    const minutes = getMinutes(date)

    const minutesFromStart = (hours - START_HOUR) * 60 + minutes

    // If appointment is before opening hour, we stick it on top
    if (minutesFromStart < 0) return 0
    return minutesFromStart * PX_PER_MINUTE
}

// Calculate height based on duration
export const calculateHeight = (startTime: string, endTime: string): number => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMinutes = differenceInMinutes(end, start)

    return durationMinutes * PX_PER_MINUTE
}

export const generateDaySlots = (date: Date): Date[] => {
    const slots: Date[] = []
    let current = setMilliseconds(setSeconds(setMinutes(setHours(date, START_HOUR), 0), 0), 0)
    const end = setMilliseconds(setSeconds(setMinutes(setHours(date, END_HOUR), 0), 0), 0)

    while (isBefore(current, end)) {
        slots.push(current)
        current = addMinutes(current, 30)
    }
    return slots
}

// Helper to check if a slot overlaps with another booking
const isSlotAvailable = (
    slotStart: Date,
    slotEnd: Date,
    booked: { start_time: string; end_time: string }[]
) => {
    return !booked.some((b) => {
        const bStart = new Date(b.start_time)
        const bEnd = new Date(b.end_time)
        return slotStart < bEnd && slotEnd > bStart
    })
}

export const calculateAvailableSlots = (
    date: Date,
    serviceDuration: number,
    bookedSlots: { start_time: string; end_time: string }[]
) => {
    const morningSlots: Date[] = []
    const afternoonSlots: Date[] = []
    const now = new Date()
    const slotInterval = 30

    let currentSlot = setMilliseconds(
        setSeconds(setMinutes(setHours(date, START_HOUR), 0), 0),
        0
    )

    const endOfDay = setMinutes(setHours(date, END_HOUR), 0)

    while (isBefore(currentSlot, endOfDay)) {
        const slotEnd = new Date(
            currentSlot.getTime() + serviceDuration * 60000
        )

        const isFuture = currentSlot > now

        // Moves slots before 16hr to morning hours and after 16h to afternoon hours
        if (isFuture && isSlotAvailable(currentSlot, slotEnd, bookedSlots)) {
            if (currentSlot.getHours() < 16) {
                morningSlots.push(currentSlot)
            } else {
                afternoonSlots.push(currentSlot)
            }
        }

        currentSlot = new Date(currentSlot.getTime() + slotInterval * 60000)
    }

    return {
        morningSlots,
        afternoonSlots,
    }
}