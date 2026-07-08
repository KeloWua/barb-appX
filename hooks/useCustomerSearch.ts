import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useCustomerSearch() {
    const [search, setSearch] = useState('')
    const queryClient = useQueryClient()

    const { data: results = [], isLoading } = useQuery({
        queryKey: ['customer-search', search],
        queryFn: async () => {
            if (search.trim().length < 2) return []
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, phone')
                .eq('role', 'client')
                .or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
                .limit(10)
            if (error) throw new Error(error.message)
            return data
        },
        enabled: search.trim().length >= 2,
    })

    const createWalkinClient = useMutation({
        mutationFn: async ({ full_name, phone }: { full_name: string; phone?: string }) => {
            const { data, error } = await supabase.functions.invoke('create-walkin-client', {
                body: { full_name, phone },
            })
            if (error) throw error
            if (data?.error) throw new Error(data.error)
            return data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer-search'] })
        },
    })

    return { search, setSearch, results, isLoading, createWalkinClient }
}