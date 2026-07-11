import { Platform, Alert } from 'react-native'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { generateIcs } from '../lib/generateIcs'
import type { AppointmentWithRelations } from '../types/app'

export function useAddToCalendar() {
    const addToCalendar = async (appointment: AppointmentWithRelations) => {
        try {
            const ics = generateIcs(appointment)

            if (Platform.OS === 'web') {
                const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `cita-${appointment.id}.ics`
                document.body.appendChild(link)
                link.click()
                link.remove()
                URL.revokeObjectURL(url)
                return
            }

            const file = new File(Paths.cache, `cita-${appointment.id}.ics`)
            file.create({ overwrite: true })
            file.write(ics)

            const isAvailable = await Sharing.isAvailableAsync()
            if (!isAvailable) throw new Error('SHARING_NOT_AVAILABLE')

            await Sharing.shareAsync(file.uri, {
                mimeType: 'text/calendar',
                dialogTitle: 'Añadir al calendario',
                UTI: 'com.apple.ical.ics',
            })
        } catch {
            if (Platform.OS === 'web') {
                window.alert('No se pudo generar el archivo de calendario.')
            } else {
                Alert.alert('Error', 'No se pudo añadir al calendario.')
            }
        }
    }

    return { addToCalendar }
}