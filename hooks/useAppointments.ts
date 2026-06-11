import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getAppointmentsByRange } from "../lib/repositories/appointmentRepository"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'

type ViewMode = 'day' | 'week' | 'month'

export const useAppointments = (selectedDate: Date, viewMode: ViewMode, barberId?: string) => {

    const { startDate, endDate } = useMemo(() => {
        if (viewMode === 'day') return {
            startDate: format(selectedDate, 'yyyy-MM-dd'),
            endDate: format(selectedDate, 'yyyy-MM-dd')
        }
        if (viewMode === 'week') return {
            startDate: format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
            endDate: format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        }
        return {
            startDate: format(startOfMonth(selectedDate), 'yyyy-MM-dd'),
            endDate: format(endOfMonth(selectedDate), 'yyyy-MM-dd')
        }
    }, [selectedDate, viewMode])

    const { data: appointments, isLoading } = useQuery({
        queryKey: ['appointments', startDate, endDate, barberId],
        queryFn: () => getAppointmentsByRange(startDate, endDate, barberId).then(res => res.data || []),
    })

    return { appointments, isLoading }
}