import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useBarberSchedule(barberId: string | undefined) {
    return useQuery({
        queryKey: ['barber-schedule', barberId],
        queryFn: async () => {
            if (!barberId) return []

            const { data, error } = await supabase
                .from('barber_schedules')
                .select('*')
                .eq('barber_id', barberId)
            console.log('useBarberSchedule', { barberId, data, error })
            if (error) throw error
            return data
        },
        enabled: !!barberId
    })
}