import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert } from "react-native"
import { useAuth } from "./useAuth"
import { getProfile, updateProfile } from "../lib/repositories/profileRepository"
import type { ProfileFormData } from "../types/app"


export const useProfile = () => {
    const { user, profile: authProfile } = useAuth()
    const queryClient = useQueryClient()

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: () => getProfile(user!.id).then(res => res.data),
        enabled: !!user?.id,
        initialData: authProfile,
    })

    const { mutate: saveProfile, isPending } = useMutation({
        mutationFn: (data: ProfileFormData) => updateProfile(user!.id, {
            full_name: data.full_name,
            phone: data.phone ?? null,
            avatar_url: data.avatar_url ?? null,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
            Alert.alert('Success', 'Profile updated successfully')
        },
        onError: () => {
            Alert.alert('Error', 'Could not update profile. Try again.')
        }
    })

    return { profile, isLoading, saveProfile, isPending }
}