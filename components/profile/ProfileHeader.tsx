import { View, Text } from "react-native"
import type { Profile } from "../../types/database"

interface ProfileHeaderProps {
    profile: Profile | null
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
    return (
        <View className="items-center mb-8 mt-4">
            <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-2">
                <Text className="text-4xl font-bold text-blue-600">
                    {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
                </Text>
            </View>
        </View>
    )
}