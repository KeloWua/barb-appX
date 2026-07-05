import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import SideMenu from '../../components/ui/SideMenu'
import MenuButton from '../../components/ui/MenuButton'

export default function ClientDashboard() {
  const router = useRouter()

  return (
    <View className='flex-1 bg-slate-50 p-4'>
      <SideMenu />
      {/* Header */}
      <View className='flex-row justify-between items-center px-4 pt-12 pb-4 bg-white border-b rounded-sm border-slate-200'>
        <MenuButton />
        <Text className='text-lg font-bold text-slate-900'>Inicio</Text>
        <View className='w-8' />
      </View>
      {/* Content */}
      <View className='p-4'>
        <Text className='text-2xl font-bold text-slate-900'>Hola, cliente</Text>

        <TouchableOpacity
          onPress={() => router.push('/book/select-service')}
          className='bg-slate-900 rounded-2xl py-4 px-5 mb-3 flex-row justify-between items-center'
        >
          <Text className='text-white font-bold text-base'>Reservar cita</Text>
          <Text className='text-white text-lg'>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/appointments')}
          className='bg-white border border-slate-200 rounded-2xl py-4 px-5 flex-row justify-between items-center'
        >
          <Text className='text-slate-900 font-bold text-base'>Ver mis citas</Text>
          <Text className='text-slate-900 text-lg'>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}