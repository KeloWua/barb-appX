import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, ProfileFormData } from '../../types/app'
import { useProfile } from '../../hooks/useProfile'
import ProfileHeader from './ProfileHeader'
import ProfileBaseFields from './ProfileBaseFields'
import SideMenu from '../ui/SideMenu'
import MenuButton from '../ui/MenuButton'


interface ProfileScreenProps {
    title?: string
    extraFields?: React.ReactNode
}

export default function ProfileSCreen({ title = 'My Profile', extraFields }: ProfileScreenProps) {
    const { profile, isLoading, saveProfile, isPending } = useProfile()
    const { control, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        values: {
            full_name: profile?.full_name ?? '',
            phone: profile?.phone ?? '',
            avatar_url: profile?.avatar_url ?? '',
        }
    })

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-white'>
                <ActivityIndicator size='large' color='#3b82f6' />
            </View>
        )
    }

    return (
        <View className='flex-1 bg-slate-50'>
            <SideMenu />

            {/* Header */}
            <View className='flex-row justify-between items-center px-4 pt-12 pb-4 bg-white border-b border-slate-200'>
                <MenuButton />
                <Text className='text-lg font-bold text-slate-900'>{title}</Text>
                <View className='w-8' />
            </View>

            <ScrollView className='flex-1 p-4'>
                <ProfileHeader profile={profile} />
                <ProfileBaseFields control={control} errors={errors} profile={profile} />

                {/* Extra fields per role — injected from outside */}
                {extraFields}

                {/* Save button */}
                <TouchableOpacity
                    className={`bg-blue-600 rounded-xl p-4 items-center mt-4 mb-8 ${isPending ? 'opacity-50' : ''}`}
                    onPress={handleSubmit((data) => saveProfile(data))}
                    disabled={isPending}
                >
                    <Text className='text-white font-semibold text-base'>
                        {isPending ? 'Saving...' : 'Save changes'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )



}