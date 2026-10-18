import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Service } from '../types/database'

export type ServiceInput = Omit<Service, 'id'>

const ADMIN_KEY = ['admin-services']

// Lists ALL services (active and inactive). Only admins can read inactive ones (RLS).
export function useAdminServices() {
    return useQuery({
        queryKey: ADMIN_KEY,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('is_active', { ascending: false })
                .order('name_es')

            if (error) throw new Error(error.message)
            return data as Service[]
        },
    })
}

export function useSaveService() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, values }: { id?: string; values: ServiceInput }) => {
            const query = id
                ? supabase.from('services').update(values).eq('id', id)
                : supabase.from('services').insert(values)

            const { data, error } = await query.select().single()
            if (error) throw new Error(error.message)
            return data as Service
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADMIN_KEY })
            queryClient.invalidateQueries({ queryKey: ['active-services'] })
        },
    })
}
