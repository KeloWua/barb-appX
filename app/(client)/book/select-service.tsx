import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useServices } from '../../../hooks/useServices'
import { useBookingStore } from '../../../stores/bookingStore'
import type { Service } from '../../../types/database'

export default function SelectServiceScreen() {
    const router = useRouter()
    const { data: services, isLoading } = useServices()
    const setService = useBookingStore((s) => s.setService)

    const handleSelect = (service: Service) => {
        setService(service)
        router.push('/book/select-barber')
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
            <Text className='text-lg font-bold text-slate-900 mb-4'>Elige un servicio</Text>
            <FlatList
                data={services}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleSelect(item)}
                        className='bg-white border border-slate-200 rounded-xl px-4 py-4 mb-3 flex-row justify-between items-center'
                    >
                        <View>
                            <Text className='font-bold text-slate-900 text-base'>{item.name_es}</Text>
                            <Text className='text-slate-500 text-sm mt-1'>{item.duration_minutes} min</Text>
                        </View>
                        <Text className='font-bold text-slate-900 text-base'>{item.price}€</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text className='text-slate-500 text-center mt-10'>No hay servicios disponibles en este momento.</Text>
                }
            />
        </View>
    )
}