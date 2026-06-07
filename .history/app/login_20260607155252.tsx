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
}