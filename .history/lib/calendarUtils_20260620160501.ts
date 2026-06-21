import { differenceInMinutes, getHours, getMinutes } from 'date-fns'

export const START_HOUR = 9 // 9:00
export const END_HOUR = 21 // 21:00
export const PX_PER_MINUTE = 1.5 // Visual scale ( 1 hour = 90px )
export const COLUMN_WIDTH = 180 // Fixed width of each barber

export const getDayTotalMinutes = () => (END_HOUR - START_HOUR) * 60
export const getDayTotalHeight = () => getDayTotalMinutes() * PX_PER_MINUTE

// Converts one hour (ISO string) in 'top' (Y) position
