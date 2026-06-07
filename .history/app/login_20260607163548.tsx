import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'
import { loginSchema, LoginFormData } from '../types/app'

export default function LoginScreen() {
    const [isLoading, setIsLoading] = useState(false)
    const { control, handleSubmit, formState: { errors } } =
        useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
        })
        setIsLoading(false)
        if (error) Alert.alert('Error', error.message)
    }

    return (
        <View className="flex-1 justify-center px-6 bg-white">
            <Text className="text-3x1 font-bold mb-8 text-slate-900 text-center">Barb-AppX</Text>
            <Controller control={control} name="email" render={({
                field: {
                    onChange, value
                }
            }) => (
                <View className="mb-4">
                    <TextInput
                    className="border border-slate-300 rounded-lg p-4 bg-slate-50"
                    placeholder="Email" autoCapitalize="none"
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                    />
                </View>
            )} />
            <Controller control={control} name="password" render={({ field: {
                onChange, value
            } }) => (
                <View>
            )}/>

        </View >
    )
}