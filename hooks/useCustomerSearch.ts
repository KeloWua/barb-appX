import { useState, useCallback } from 'react'
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
                .or(`full_name.ilike.%#${search}%,phone.ilike%${search}%`)
                .limit(10)
            if (error) throw error
            return data
        },
        enabled: search.trim().length >= 2,
    })

    // Create 'walk-in' customer quickly with just name + phone
    const createCustomer = useMutation({
        mutationFn: async ({ fullName, phone }: { fullName: string; phone: string }) => {
            const { data, error } = await supabase
                .from('profiles')
                .insert({ full_name: fullName, phone })
                .select('id, full_name, phone')
                .single()
            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer-search'] })
        },
    })

    return {
        search,
        setSearch: useCallback((v: string) => setSearch(v), []),
        results,
        isLoading,
        createCustomer,
    }
}