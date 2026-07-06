import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useBookedSlots(
    barberId: string | undefined,
    startDate: string,
    endDate: string
) {
    const queryClient = useQueryClient()
    const channelId = useRef(`barber_availability_${Math.random().toString(36).slice(2)}`)

    const query = useQuery({
        queryKey: ['booked-slots', barberId, startDate, endDate],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_booked_slots', {
                p_barber_id: barberId,
                p_start_date: startDate,
                p_end_date: endDate,
            })
            if (error) throw new Error(error.message)
            return data as { start_time: string; end_time: string; status: string }[]
        },
        enabled: !!barberId,
    })

    useEffect(() => {
        if (!barberId) return

        const channel = supabase
            .channel(`barber-availability-${barberId}`, {
                config: { broadcast: { self: false } },
            })
            .on('broadcast', { event: 'availability_changed' }, () => {
                queryClient.invalidateQueries({ queryKey: ['booked-slots', barberId] })
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [barberId, queryClient])

    return query
}