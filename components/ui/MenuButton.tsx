import { TouchableOpacity, Text } from 'react-native'
import { useUIStore } from '../../stores/uiStore'

export default function MenuButton() {
    const { openMenu } = useUIStore()

    return (
        <TouchableOpacity className='p-2' onPress={openMenu}>
            <Text className='text-2xl'>☰</Text>
        </TouchableOpacity>
    )
}

