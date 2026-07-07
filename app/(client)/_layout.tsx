import { useEffect, useRef } from 'react'
import { Stack, useSegments } from 'expo-router'
import { View } from 'react-native'
import SideMenu from '../../components/ui/SideMenu'
import MenuButton from '../../components/ui/MenuButton'
import { useBookingStore } from '../../stores/bookingStore'
import { releaseAppointmentHold } from '../../lib/repositories/appointmentRepository'

export default function ClientLayout() {
    const segments = useSegments()
    const wasInBookFlow = useRef(false)

    useEffect(() => {
        const isInBookFlow = segments.includes('book')

        // Cancels appointment hold when you leave booking process, e.g.: moving to another screen like Home, Profile...
        if (wasInBookFlow.current && !isInBookFlow) {
            const { holdId, clearBooking } = useBookingStore.getState()
            if (holdId) {
                releaseAppointmentHold(holdId).catch(() => {})
            }
            clearBooking()
        }

        wasInBookFlow.current = isInBookFlow
    }, [segments])

    return (
        <View className="flex-1">
            <SideMenu />
            <View className="flex-row items-center px-5 pt-12 pb-2 bg-slate-50">
                <MenuButton />
            </View>
            <Stack screenOptions={{ headerShown: false }} />
        </View>
    )
}