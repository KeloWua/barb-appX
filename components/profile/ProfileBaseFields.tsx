import { View, Text, TextInput } from "react-native"
import { Controller } from "react-hook-form"
import type { Control, FieldErrors } from "react-hook-form"
import type { ProfileFormData } from "../../types/app"
import type { Profile } from "../../types/database"

interface ProfileBaseFieldsProps {
    control: Control<ProfileFormData>
    errors: FieldErrors<ProfileFormData>
    profile: Profile | null
}

export default function ProfileBaseFields({ control, errors, profile }: ProfileBaseFieldsProps) {
    return (
        <View>
            {/* Full name */}
            <Text className="text-sm font-medium text-slate-700 mb-1">Full name</Text>
            <Controller control={control} name="full_name" render={({ field: { onChange, value } }) => (
                <View className="mb-4">
                    <TextInput
                        className="border border-slate-300 rounded-lg p-4 bg-white text-slate-900"
                        value={value}
                        onChangeText={onChange}
                        placeholder="Your full name"
                    />
                    {errors.full_name && (
                        <Text className="text-red-500 text-sm mt-1">{errors.full_name.message}</Text>
                    )}
                </View>
            )} />

            {/* Email — read only */}
            <Text className="text-sm font-medium text-slate-700 mb-1">Email</Text>
            <View className="mb-4">
                <TextInput
                    className="border border-slate-200 rounded-lg p-4 bg-slate-100 text-slate-400"
                    value={profile?.email ?? ''}
                    editable={false}
                />
                <Text className="text-xs text-slate-400 mt-1">Email cannot be changed here</Text>
            </View>

            {/* Phone */}
            <Text className="text-sm font-medium text-slate-700 mb-1">Phone</Text>
            <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
                <View className="mb-4">
                    <TextInput
                        className="border border-slate-300 rounded-lg p-4 bg-white text-slate-900"
                        value={value ?? ''}
                        onChangeText={onChange}
                        placeholder="+34 600 000 000"
                        keyboardType="phone-pad"
                    />
                    {errors.phone && (
                        <Text className="text-red-500 text-sm mt-1">{errors.phone.message}</Text>
                    )}
                </View>
            )} />

            {/* Avatar URL */}
            <Text className="text-sm font-medium text-slate-700 mb-1">Avatar URL</Text>
            <Controller control={control} name="avatar_url" render={({ field: { onChange, value } }) => (
                <View className="mb-4">
                    <TextInput
                        className="border border-slate-300 rounded-lg p-4 bg-white text-slate-900"
                        value={value ?? ''}
                        onChangeText={onChange}
                        placeholder="https://example.com/avatar.jpg"
                        autoCapitalize="none"
                    />
                    {errors.avatar_url && (
                        <Text className="text-red-500 text-sm mt-1">{errors.avatar_url.message}</Text>
                    )}
                </View>
            )} />
        </View>
    )
}