import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { useBarbers } from '../../../hooks/useBarbers'
import { useBookingStore } from '../../../stores/bookingStore'
import type { Barber } from '../../../types/database'
import { useInteropClassName } from 'expo-router/build/link/useLinkHooks'

export default function SelectBarberScreen() {
    const router = useRouter()
    const { data: barbers, isLoading } = useBarbers()
    const { setBarber, selectedService } = useBookingStore()

    const handleSelect = (barber: Barber) => {
        setBarber(barber)
        router.push('/book/select-datetime')
    }

    if (!selectedService) {
        return (
            <View className='flex-1 items-center justify-center bg-slate-50'>
                <Text className='text-slate-500'>Primero elige un servicio</Text>
            </View>
        )
    }

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-slate-50'>
                <ActivityIndicator size='large' color='#0f172a' />
            </View>
        )
    }

    return (
        <View className='flex-1 bg-slate-50 px-5 pt-6'>
            <Text className='text-lg font-bold text-slate-900 mb-1'>Elige un barbero</Text>
            <Text className='text-slate-500 text-sm mb-4'>Para: {selectedService.name_es}</Text>
            <FlatList 
                data={barbers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleSelect(item)}
                        className='bg-white border border-slate-200 rounded-xl px-4 py-4 mb-3 flex-row items-center'
                    >
                        {item.photo_url ? (
                            <Image source={{ uri: item.photo_url }} className='w-12 h-12 rounded-full mr-3' />
                        ) : (
                            <View
                                className='w-12 h-12 rounded-full mr-3 items-center justify-center'
                                style={{ backgroundColor: item.color_code }}
                            >
                                <Text className='text-white font-bold'>{item.name.charAt(0)}</Text>
                            </View>
                        )}
                        <Text className='font-bold text-slate-900 text-base'>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text className='text-slate-500 text-center mt-10'>No hay barberos disponibles</Text>
                }
            />
        </View>
    )
}