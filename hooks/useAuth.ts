import { useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useAuthStore } from "../stores/authStore"
import { getCurrentUserRole, getCurrentUserProfile, signOut } from "../lib/auth"

export const useAuth = () => {
    const store = useAuthStore()

    useEffect(() => {
        let mounted = true;
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (session?.user) {
                    const [role, profile] = await Promise.all([
                        getCurrentUserRole(session.user.id),
                        getCurrentUserProfile(session.user.id)
                    ])
                    if (mounted) store.setAuth(session, role, profile)
                } else {
                    if (mounted) store.clearAuth()
                }
            }
            catch (error) {
                console.error("Error initializing auth:", error)

                if (mounted) store.clearAuth()
            } finally {
                if (mounted) store.setInitialized(true)
            }
        }
        initializeAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') store.clearAuth()
            else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
                if (event === 'SIGNED_IN') {
                    try {
                    const [role, profile] = await Promise.all([
                        getCurrentUserRole(session.user.id),
                        getCurrentUserProfile(session.user.id)
                    ])
                    store.setAuth(session, role, profile)
                    } catch (error) {
                        console.error("Error fetching user data on auth change:", error)
                        store.clearAuth()
                    }
                } else {
                    const currentRole = useAuthStore.getState().role
                    const currentProfile = useAuthStore.getState().profile
                    store.setAuth(session, currentRole, currentProfile)
                }
            }
        })

        return () => { mounted = false; subscription.unsubscribe(); }
    }, [])

    return {
        ...store,
        isAuthenticated: !!store.session,
        signOut
    }
}