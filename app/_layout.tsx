import { useEffect, useState } from "react"
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from "../hooks/useAuth"
import { useSetupStatus } from "../hooks/useSetupStatus"
import { View, ActivityIndicator } from 'react-native'
/*@ts-ignore-next-line*/
import '../global.css'

const queryClient = new QueryClient()

function AuthGuard() {
    const { isInitialized, isAuthenticated, role } = useAuth()
    const segments = useSegments()
    const router = useRouter()
    const navigationState = useRootNavigationState() // Check if router loaded
    // First-run setup: admins must finish it before using the app
    const { data: setup, isLoading: setupLoading } = useSetupStatus(isAuthenticated && role === 'admin')

    useEffect(() => {
        if (!isInitialized || !navigationState?.key) return // IMPORTANT: Wait for router

        const currentGroup = segments[0]
        const inAuthGroup = currentGroup === '(auth)'
        const isSharedAuthRoute = currentGroup === 'profile'

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login')
        } else if (isAuthenticated && role) {
            const expectedGroup = `(${role})`

            if (role === 'admin') {
                if (setupLoading) return
                const inSetup = currentGroup === '(admin)' && (segments as string[])[1] === 'setup'
                if (setup && !setup.complete && !inSetup) {
                    router.replace('/(admin)/setup')
                    return
                }
            }

            
            // We allow access to role groups and shared authenticated routes like /profile
            /*@ts-ignore-next-line*/
            if (inAuthGroup || segments.length === 0 || (currentGroup !== expectedGroup && !isSharedAuthRoute)) {
                router.replace(`/${expectedGroup}`)
            }
        }
    }, [isInitialized, isAuthenticated, role, segments, navigationState?.key, setup, setupLoading])

    if (!isInitialized) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        )
    }
    return <Slot />
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthGuard />
        </QueryClientProvider>
    )
}