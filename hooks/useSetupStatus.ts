import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { SHOP_COLUMNS } from '../lib/repositories/setupRepository'

export type SetupStatus = { businessDone: boolean; barberDone: boolean; serviceDone: boolean; complete: boolean }

// Setup is complete when business info is filled, there is at least one bookable barber (linked to a user) and one active service.
export function useSetupStatus(enabled: boolean) {
    return useQuery({
        queryKey: ['setup-status'],
        enabled,
        queryFn: async (): Promise<SetupStatus> => {
            const [shop, barbers, services] = await Promise.all([
                supabase.from('shop_settings').select('*').maybeSingle(),
                supabase.from('barbers').select('id', { count: 'exact', head: true }).eq('is_active', true).not('profile_id', 'is', null),
                supabase.from('services').select('id', { count: 'exact', head: true }).eq('is_active', true),
            ])
            if (shop.error) throw new Error(shop.error.message)
            const row = (shop.data ?? {}) as Record<string, unknown>
            const filled = (k: string) => typeof row[k] === 'string' && (row[k] as string).trim() !== ''
            const businessDone = Object.values(SHOP_COLUMNS).every(filled)
            const barberDone = (barbers.count ?? 0) > 0
            const serviceDone = (services.count ?? 0) > 0
            return { businessDone, barberDone, serviceDone, complete: businessDone && barberDone && serviceDone }
        },
    })
}
