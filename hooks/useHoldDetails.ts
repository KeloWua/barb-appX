import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../types/database'

export function useHoldDetails(holdId: string | null) {
    return useQuery({
        queryKey: ['hold-details', holdId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('id', holdId)
                .single()
            if (error) throw new Error(error.message)
            return data as Appointment
        },
        enabled: !!holdId,
    })
}