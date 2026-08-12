import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { 
    getBarberSchedule,
    upsertScheduleBlock,
    deleteScheduleBlock
} from '../lib/repositories/scheduleRepository'

import type { BarberSchedule } from '../types/database'


// READ
export const useBarberSchedule = (barberId: string | undefined) => {
    return useQuery({
        queryKey: ['barberSchedule', barberId],
        queryFn: async () => {
            const { data, error } = await getBarberSchedule(barberId!)
            if (error) throw error
            return data ?? []
        },
        enabled: !!barberId,
    })
}

// CREATE / UPDATE - one block(row) at a time
export const useUpsertScheduleBlock = (barberId: string | undefined) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (block: Partial<BarberSchedule> & {
            barber_id: string,
            day_of_week: number,
            start_time: string,
            end_time: string,
            is_day_off: boolean
        }) => upsertScheduleBlock(block),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['barberSchedule', barberId] })
        },
    })
}

// DELETE - remove a block(row) from the barber's schedule
export const useDeleteScheduleBlock = (barberId: string | undefined) => { 
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (blockId: string) => deleteScheduleBlock(blockId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['barberSchedule', barberId]})
        }
    })
}