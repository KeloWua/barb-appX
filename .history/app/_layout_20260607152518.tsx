import { useEffect } from "react"
import { Slot, useRouter, useSegments } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from "../hooks/useAuth"
import { View, ActivityIndicator } from 'react-native'
import '../global.css' // MANDATORY INYECTION FOR NATIVEWIND 4

const queryClient = new QueryClient()

function AuthGuard() {
    const { isInitialized, isAuthenticated, role } = useAuth()
    const segments = useSegments()
    const router = useRouter()

    useEffect(() => {
        if (!isInitialized) return
        const inAuthGroup = segments[0] === '(auth)'

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login')
        } else if (isAuthenticated && role) {
            if (inAuthGroup || segments.length === 0) {
                if (role === 'admin') router.replace('/(admin)')
            }
        }
    },[])
}