import { useQuery } from '@tanstack/react-query'
import { getShopSettings } from '../lib/repositories/shopSettingsRepository'

export function useShopSettings() {
    return useQuery({
        queryKey: ['shop-settings'],
        queryFn: async () => {
            const { data, error } = await getShopSettings()
            if (error) throw new Error(error.message)
            return data
        },
        staleTime: 1000 * 60 * 60,
    })
}
