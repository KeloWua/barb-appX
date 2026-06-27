import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Barber } from '../types/database';

export function useBarbers() {
    return useQuery({
        queryKey: ['active-barbers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('barbers')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) {
                throw new Error(error.message);
            }

            return data as Barber[];
        },
    });
}