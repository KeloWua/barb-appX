import { TouchableOpacity, Text } from 'react-native'
import { useRouter } from 'expo-router'

interface HomeButtonProps {
    title?: string
}

export default function HomeButton({
    title = 'Volver al inicio',
}: HomeButtonProps) {
    const router = useRouter()

    return (
        <TouchableOpacity
            onPress={() => router.replace('/')}
            className="bg-slate-900 rounded-2xl py-4 items-center"
        >
            <Text className="text-white font-bold text-base">
                {title}
            </Text>
        </TouchableOpacity>
    )
}