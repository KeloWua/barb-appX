import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { updateProfile } from '../../lib/repositories/profileRepository'
import { registerSchema, RegisterFormData } from '../../types/app'

export default function RegisterScreen() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { control, handleSubmit, formState: { errors } } =
        useForm<RegisterFormData>({
            resolver: zodResolver(registerSchema),
            defaultValues: {
                full_name: '',
                email: '',
                phone: '',
                password: ''
            }
        })

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true)
        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: { data: { full_name: data.full_name } }
        })
        if (error) {
            setIsLoading(false)
            const message = error.message.toLowerCase().includes('already registered')
                ? 'Ya existe una cuenta con este email'
                : error.message.toLowerCase().includes('password')
                ? 'La contraseña debe tener al menos 6 caracteres'
                : error.message
            Alert.alert('Error', message)
            return
        }
        if (!authData.session) {
            setIsLoading(false)
            Alert.alert('Revisa tu correo', 'Te enviamos un email para confirmar tu cuenta.')
            router.replace('/(auth)/login')
            return
        }
        // The handle_new_user trigger already created the profile; save the phone on it
        const { error: profileError } = await updateProfile(authData.session.user.id, { phone: data.phone })
        setIsLoading(false)
        if (profileError) {
            Alert.alert('Cuenta creada', 'No se pudo guardar tu teléfono. Puedes editarlo desde tu perfil.')
        }
        // With a session, AuthGuard redirects to the client area automatically
    }
    return (
        <View className="flex-1 justify-center px-6 bg-white">
            <Text className="text-3xl font-bold mb-8 text-slate-900 text-center">Crear cuenta</Text>
            <Controller control={control} name="full_name" render={({ field: { onChange, value } }) => (
                <View className="mb-4">
                    <TextInput className="border border-slate-300 rounded-lg p-4 bg-slate-50" placeholder="Nombre completo" autoCapitalize="words" value={value} onChangeText={onChange} />
                    {errors.full_name && <Text className="text-red-500 mt-1">{errors.full_name.message}</Text>}
                </View>
            )} />
            <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
                <View className="mb-4">
                    <TextInput className="border border-slate-300 rounded-lg p-4 bg-slate-50" placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={value} onChangeText={onChange} />
                    {errors.email && <Text className="text-red-500 mt-1">{errors.email.message}</Text>}
                </View>
            )} />
            <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
                <View className="mb-4">
                    <TextInput className="border border-slate-300 rounded-lg p-4 bg-slate-50" placeholder="Teléfono" keyboardType="phone-pad" value={value} onChangeText={onChange} />
                    {errors.phone && <Text className="text-red-500 mt-1">{errors.phone.message}</Text>}
                </View>
            )} />
            <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
                <View className="mb-6">
                    <TextInput className="border border-slate-300 rounded-lg p-4 bg-slate-50" placeholder="Contraseña" secureTextEntry value={value} onChangeText={onChange} />
                    {errors.password && <Text className="text-red-500 mt-1">{errors.password.message}</Text>}
                </View>
            )} />
            <TouchableOpacity className={`bg-blue-600 rounded-lg p-4 items-center ${isLoading ? 'opacity-50' : ''}`} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
                <Text className="text-white font-semibold text-lg">{isLoading ? 'Cargando...' : 'Crear cuenta'}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mt-4 items-center" onPress={() => router.back()}>
                <Text className="text-blue-600">¿Ya tienes cuenta? Entrar</Text>
            </TouchableOpacity>
        </View>
    );
}
