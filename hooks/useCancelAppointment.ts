import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelAppointment } from '../lib/repositories/appointmentRepository'

export function useCancelAppointment(appointmentId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const { data, error } = await cancelAppointment(appointmentId)
            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-appointments'] })
            queryClient.invalidateQueries({ queryKey: ['appointment', appointmentId] })
        },
    })
}