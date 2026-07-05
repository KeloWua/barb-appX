import { useEffect, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'
import { getAppointmentsByRange, updateAppointmentStatus, holdAppointmentSlot, releaseAppointmentHold } from '../lib/repositories/appointmentRepository'
import { supabase } from '../lib/supabase' // Needed to listen to WebSockets
import type { appointment_status } from '../types/database'

type ViewMode = 'day' | 'week' | 'month'

export const useAppointments = (selectedDate: Date, viewMode: ViewMode, barberId?: string) => {
    const queryClient = useQueryClient()

    // Unique ID per hook instance, stable while component is mounted (avoids channel overlapping)
    const channelId = useRef(`appointments_realtime_${Math.random().toString(36).slice(2)}`)

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

    // 1. Fetch appointments & filter out expired holds
    const { data: appointments, isLoading } = useQuery({
        queryKey: ['appointments', startDate, endDate, barberId],
        queryFn: async () => {
            const res = await getAppointmentsByRange(startDate, endDate, barberId)
            const data = res.data || []

            const now = new Date().getTime()

            // Filter logic: Ignore 'holding' appointments that have expired
            return data.filter(apt => {
                // Filter logic: 'cancelled' appointments won't be shown
                if (apt.status === 'cancelled') return false
                // TODO: Create separate cancelled appointments query to show on a diff table for analysis purpose.

                if (apt.status !== 'holding') return true
                if (!apt.expires_at) return false
                return new Date(apt.expires_at).getTime() > now
            })
        },
    })

    // 2. Real-Time WebSockets: Updates UI instantly if someone books a slot
    useEffect(() => {
        const channel = supabase.channel(channelId.current)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                () => {
                    // This forces the hook to re-fetch automatically when DB changes
                    queryClient.invalidateQueries({ queryKey: ['appointments'] })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [queryClient])

    // 3. Status change mutation (for Barbers)
    const { mutate: changeStatus, isPending: isChangingStatus } = useMutation({
        mutationFn: ({ id, status }: { id: string; status: appointment_status }) =>
            updateAppointmentStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
    })

    // 4. Hold action (for Clients)
    const holdSlot = async (clientId: string, serviceId: string, startTime: string, endTime: string) => {
        if (!barberId) throw new Error("barberId is required to hold a slot")

        const res = await holdAppointmentSlot({
            barber_id: barberId,
            client_id: clientId,
            service_id: serviceId,
            start_time: startTime,
            end_time: endTime
        })

        if (res.error) throw res.error
        return res.data?.id // Returns the ID so we can save it in Zustand
    }

    // 5. Release action (for Clients changing their mind)
    const releaseHold = async (holdId: string) => {
        await releaseAppointmentHold(holdId)
    }

    return {
        appointments,
        isLoading,
        changeStatus,
        isChangingStatus,
        holdSlot,
        releaseHold
    }
} 