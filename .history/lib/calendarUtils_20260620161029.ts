import { differenceInMinutes, getHours, getMinutes } from 'date-fns'

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

export const calculateHeight = (startTime: string, endTime: string): number => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const duration_minutes = differenceInMinutes(end, start)
}