import { View, Text } from 'react-native'

export default function MyAppointmentsScreen() {
    return (
        <View className='flex-1 bg-slate-50 items-center justify-center px-5'>
            <Text className='text-slate-500'>Aqui se verán tus citas próximamente.</Text>
        </View>
    )
}