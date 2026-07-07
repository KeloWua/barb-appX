import type { AppointmentWithRelations } from '../types/app'
import { SHOP_ADDRESS, SHOP_NAME, SHOP_PHONE } from './shopInfo'


// Formats a date with iCalendar format: YYYYMMDDTHHmmssZ (always UTC)
const toIcsDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export const generateIcs = (appointment: AppointmentWithRelations) => {
    const start = new Date(appointment.start_time)
    const end = new Date(appointment.end_time)
    const now = new Date()

    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//BarbApp//Appointment//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${appointment.id}@barbapp`,
        `DTSTAMP:${toIcsDate(now)}`,
        `DTSTART:${toIcsDate(start)}`,
        `DTEND:${toIcsDate(end)}`,
        `SUMMARY:${appointment.service.name_es} - ${appointment.barber.name}`,
        `DESCRIPTION:Cita de ${appointment.service.name_es} con ${appointment.barber.name}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:Recordatorio de barberia',
        `LOCATION:${SHOP_NAME}\\, ${SHOP_ADDRESS}`,
        // Can change TRIGGER:-PT'time reminder'. I chose 1 hour
        'TRIGGER:-PT1H',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n') // iCalendar line break must be CRLF, not only \n

    return ics
}