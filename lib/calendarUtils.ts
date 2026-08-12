import { setHours, setMinutes, setSeconds, setMilliseconds, addMinutes, isBefore, differenceInMinutes, getHours, getMinutes } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

export const PX_PER_MINUTE = 1.5 // Visual scale ( 1 hour = 90px )
export const COLUMN_WIDTH = 180 // Fixed width of each barber
export const DEFAULT_TIMEZONE = 'Europe/Madrid' // Fallback if shop_settings DB have no rows yet

export type TimeShift = {
    start_time: string; // e.g., "10:00"
    end_time: string; // e.g., "14:00"
}


// Dynamic calculations based on provided start/end hours
export const getDayTotalMinutes = (startHour: number = 9, endHour: number = 21) => (endHour - startHour) * 60
export const getDayTotalHeight = (startHour: number = 9, endHour: number = 21) => getDayTotalMinutes(startHour, endHour) * PX_PER_MINUTE

// Converts one hour (ISO string) in 'top' (Y) position relative to the grid start time
export const calculateTop = (startTime: string, baseStartHour: number = 9, timezone: string = DEFAULT_TIMEZONE): number => {
    const date = toZonedTime(new Date(startTime), timezone)
    const hours = getHours(date)
    const minutes = getMinutes(date)

    const minutesFromStart = (hours - baseStartHour) * 60 + minutes

    // If appointment is before opening hour, we stick it on top to avoid visual bugs
    if (minutesFromStart < 0) return 0
    return minutesFromStart * PX_PER_MINUTE
}

// Calculate height based on duration (This doesn't need start/end hours, it just measures time)
export const calculateHeight = (startTime: string, endTime: string): number => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMinutes = differenceInMinutes(end, start)

    return durationMinutes * PX_PER_MINUTE
}

// Generates clickable empty slots for the Barber Dashboard grid
export const generateDaySlots = (date: Date, startHour: number = 9, endHour: number = 21, timezone: string = DEFAULT_TIMEZONE): Date[] => {
    const slots: Date[] = []
    let current = fromZonedTime(setMilliseconds(setSeconds(setMinutes(setHours(date, startHour), 0), 0), 0), timezone)
    const end = fromZonedTime(setMilliseconds(setSeconds(setMinutes(setHours(date, endHour), 0), 0), 0), timezone)

    while (isBefore(current, end)) {
        slots.push(current)
        current = addMinutes(current, 30)
    }
    return slots
}

// Helper to check if a slot overlaps with another booking (or a blocked break)
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

// NEW helper: Checks if a slot fits entirely INSIDE any of the barber's shifts ( NOW RECEIVES timezone)
const isWithinShifts = (slotStart: Date, slotEnd: Date, shifts: TimeShift[], baseDate: Date, timezone: string) => {
    if (shifts.length === 0) return false;

    return shifts.some(shift => {
        const [startHour, startMin] = shift.start_time.split(':').map(Number)
        const [endHour, endMin] = shift.end_time.split(':').map(Number)

        const shiftStart = fromZonedTime(setMilliseconds(setSeconds(setMinutes(setHours(baseDate, startHour), startMin), 0), 0), timezone)
        const shiftEnd = fromZonedTime(setMilliseconds(setSeconds(setMinutes(setHours(baseDate, endHour), endMin), 0), 0), timezone)

        // The slot must start at or after the shift starts, AND end at or before the shift ends
        return slotStart >= shiftStart && slotEnd <= shiftEnd
    })
}

// Calculate slots based on a SPECIFIC BARBER's dynamic schedule shifts
export const calculateAvailableSlots = (
    date: Date,
    serviceDuration: number,
    bookedSlots: { start_time: string; end_time: string }[],
    shifts: TimeShift[],
    isDayOff: boolean = false,
    timezone: string = DEFAULT_TIMEZONE
) => {
    const morningSlots: Date[] = []
    const afternoonSlots: Date[] = []

    // If it's their day off or they are on vacation, return nothing
    if (isDayOff || !shifts || shifts.length === 0) {
        return { morningSlots, afternoonSlots }
    }
    const now = new Date()
    const slotInterval = 30

    // Scan the entire 24h day. isWithinShifts will automatically filter out the hours they don't work
    let currentSlot = fromZonedTime(setMilliseconds(
        setSeconds(setMinutes(setHours(date, 0), 0), 0),
        0), timezone)
    const endOfDay = fromZonedTime(setMinutes(setHours(date, 23), 0), timezone)

    while (isBefore(currentSlot, endOfDay)) {
        const slotEnd = new Date(
            currentSlot.getTime() + serviceDuration * 60000
        )
        const isFuture = currentSlot > now

        // Moves slots before 16hr to morning hours and after 16h to afternoon hours
        // Checks: 
        // 1. Is in future? 
        // 2. Is inside a working shift? 
        // 3. Is free from appointments?
        if (isFuture && isWithinShifts(currentSlot, slotEnd, shifts, date, timezone) && isSlotAvailable(currentSlot, slotEnd, bookedSlots)) {
            const localHour = getHours(toZonedTime(currentSlot, timezone))
            if (localHour < 16) {
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