import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native'
import { useRouter } from 'expo-router'

import { useBarbers } from '../../../hooks/useBarbers'
import SideMenu from '../../../components/ui/SideMenu'
import MenuButton from '../../../components/ui/MenuButton'
import type { Barber } from '../../../types/database'

export default function AdminBarbersScreen() {
    const router = useRouter()
    const { data: barbers = [], isLoading } = useBarbers(false)

    return (
        <View className='flex-1 bg-slate-50'>
            <SideMenu />

            <View className='flex-row justify-between items-center px-4 pt-12 pb-4 bg-white border-b border-slate-200'>
                <MenuButton />
                <Text className='text-lg font-bold text-slate-900'>Barberos</Text>
                <View className='w-8' />
            </View>

            {isLoading ? (
                <View className='flex-1 items-center justify-center'>
                    <ActivityIndicator size='large' color='#0f172a' />
                </View>
            ) : (
                <FlatList
                    data={barbers}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }: { item: Barber }) => (
                        <View className='bg-white border border-slate-200 rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between'>
                            <View className='flex-row items-center flex-1'>
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
                            </View>

                            <TouchableOpacity
                                onPress={() => router.push(`/(admin)/barbers/${item.id}/schedule`)}
                                className='px-4 py-2 rounded-full bg-slate-900'
                            >
                                <Text className='text-white text-xs font-bold'>📅 Horario</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text className='text-slate-500 text-center mt-10'>No hay barberos registrados.</Text>
                    }
                />
            )}
        </View>
    )
}