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
        // 1. Fetch them in normal alphabetical order first
        .order('name', { ascending: true }) 

      if (clientsOnly) {
        query = query.not('profile_id', 'is', null)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(error.message)
      }

      const barbers = data as Barber[]

      // 2. Custom sort: Force barbers without profile_id ("Extras") to the very end
      return barbers.sort((a, b) => {
        const aIsDummy = a.profile_id === null
        const bIsDummy = b.profile_id === null

        if (aIsDummy && !bIsDummy) return 1  // Push 'a' to the end
        if (!aIsDummy && bIsDummy) return -1 // Push 'b' to the end
        
        // If both are normal (or both are dummies), keep alphabetical order
        return a.name.localeCompare(b.name)
      })
    },
  })
}