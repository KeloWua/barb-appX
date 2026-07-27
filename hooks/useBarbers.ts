import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Barber } from '../types/database'

export function useBarbers(clientsOnly: boolean = false) {
  return useQuery({
    queryKey: ['active-barbers', clientsOnly],
    queryFn: async () => {
      let query = supabase
        .from('barbers')
        .select('*')
        .eq('is_active', true)
        // 1. Fetch in alphabetical order
        .order('name', { ascending: true })


      if (clientsOnly) {
        // Exclude dummy barbers (profile_id is null or empty string)
        query = query.not('profile_id', 'is', null)
      }

      const { data, error } = await query
      
      if (error) {
        throw new Error(error.message)
      }

      const barbers = data as Barber[]

      // 2. Custom sort: Force barbers without profile_id ("Extras") to the very end
      return barbers.sort((a, b) => {
        const aIsDummy = !a.profile_id
        const bIsDummy = !b.profile_id

        if (aIsDummy && !bIsDummy) return 1  // Push 'a' to the end
        if (!aIsDummy && bIsDummy) return -1 // Push 'b' to the end

        return a.name.localeCompare(b.name)
      })
    },
  })
}