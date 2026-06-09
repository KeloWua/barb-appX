import { View, Text } from 'react-native'
import SideMenu from '../../components/ui/SideMenu'
import MenuButton from '../../components/ui/MenuButton'

export default function ClientDashboard() {


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
        <Text className="text-2xl font-bold text-slate-900">Hola, cliente</Text>
      </View>
    </View>
  )
}