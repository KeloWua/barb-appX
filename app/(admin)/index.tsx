import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import SideMenu from '../../components/ui/SideMenu'
import MenuButton from '../../components/ui/MenuButton'

export default function AdminDashboard() {
    const router = useRouter()

    return (
        <View className='flex-1 bg-slate-50 p-4'>
            <SideMenu />
            {/* Header */}
            <View className='flex-row justify-between items-center px-4 pt-12 pb-4 bg-white border-b rounded-sm border-slate-200'>
                <MenuButton />
                <Text className='text-lg font-bold text-slate-900'>Inicio</Text>
                <View className="w-8" />
            </View>
            {/* Content */}
            <View className="p-4">
                <Text className="text-2xl font-bold text-slate-900">Hola, Admin</Text>

                <TouchableOpacity
                    onPress={() => router.push('/(admin)/barbers')}
                    className='mt-4 bg-white border border-slate-200 rounded-xl px-4 py-4 flex-row justify-between items-center'
                >
                    <Text className='font-bold text-slate-900 text-base'>💈 Gestionar barberos</Text>
                    <Text className='text-slate-400'>›</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}