import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'
import { getAppointmentsByRange, updateAppointmentStatus } from '../lib/repositories/appointmentRepository'
import type { appointment_status } from '../types/database'

type ViewMode = 'day' | 'week' | 'month'

export const useAppointments = (selectedDate: Date, viewMode: ViewMode, barberId?: string) => {
    const queryClient = useQueryClient()

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

    const { mutate: changeStatus, isPending: isChangingStatus } = useMutation({
        mutationFn: ({ id, status }: { id: string; status: appointment_status }) =>
            updateAppointmentStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
    })

    return { appointments, isLoading, changeStatus, isChangingStatus }
}