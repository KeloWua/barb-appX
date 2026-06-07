import { useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useAuthStore } from "../stores/authStore"
import { getCurrentUserRole } from "../lib/auth"

export const useAuth = () => {
    const store = useAuthStore()

    useEffect(() => {
        let mounted = true;
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
            const role = await getCurrentUserRole(session.user.id)
            if (mounted) store.setAuth(session, role)
        } else {
            if (mounted) store.clearAuth()
        }
        if (mounted) store.setInitialized(true)
        }
    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        
    })
    })
}