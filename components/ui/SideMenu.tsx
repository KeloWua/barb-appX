import { useRouter } from 'expo-router'
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../stores/uiStore'

export default function SideMenu() {
    const { isMenuOpen, closeMenu } = useUIStore()
    const { role, profile, signOut } = useAuth()
    const router = useRouter()

    const handleNavigate = (route: string) => {
        closeMenu()
        router.push(route)
    }

    const handleSignOut = async () => {
        closeMenu()
        await signOut()
    }

    const homeRoute = role === 'admin' ? '/(admin)' : role === 'barber' ? '/(barber)' : '/(client)'
    const profileRoute = role === 'admin' ? '/(admin)/profile' : role === 'barber' ? '/(barber)/profile' : '/(client)/profile'

    return (
        <Modal visible={isMenuOpen} transparent animationType='fade' onRequestClose={closeMenu}>
            {/* Semi-transparent overlay */}
            <Pressable className='flex-1 bg-black/50' onPress={closeMenu}>
                {/* Lateral Panel - pressable child avoids closing when touching inside */}
                <Pressable className='absolute left-0 top-0 bottom-0 w-72 bg-white pt-16 px-6 shadow-2xl'>
                    {/* Menu Header */}
                    <View className='mb-8 pb-6 border-b border-slate-200'>
                        <View className='w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-3'>
                            <Text className='text-2xl font-bold text-blue-600'>
                                {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
                            </Text>
                        </View>
                        <Text className='text-lg font-bold text-slate-900'>{profile?.full_name ?? 'Usuario'}</Text>
                        <Text className='text-sm text-slate-500'>{profile?.email ?? ''}</Text>
                    </View>
                    {/* Options */}
                    <TouchableOpacity
                        className='flex-row items-center py-4 border-b border-slate-100'
                        onPress={() => handleNavigate(homeRoute)}
                    >
                        <Text className='text-base text-slate-700 font-medium'>🏠 Inicio</Text>
                    </TouchableOpacity>


                    <TouchableOpacity
                        className='flex-row items-center py-4 border-b border-slate-100'
                        onPress={() => handleNavigate(profileRoute)}
                    >
                        <Text className='text-base text-slate-700 font-medium'>👤 Perfil</Text>
                    </TouchableOpacity>

                    {/* Log Out at the bottom */}
                    <View className='absolute bottom-12 left-6 right-6'>
                        <TouchableOpacity
                            className='bg-red-50 border border-red-200 rounded-xl py-4 items-center'
                            onPress={handleSignOut}
                        >
                            <Text className='text-red-600 font-semibold'>Cerrar sesión</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

