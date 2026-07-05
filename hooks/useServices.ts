import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Service } from '../types/database';

export function useServices() {
    return useQuery({
        queryKey: ['active-services'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('is_active', true)
                .order('name_es');

            if (error) {
                throw new Error(error.message);
            }

            return data as Service[];
        },
    });
}