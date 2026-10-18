import { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'

import { useSetupStatus } from '../../../hooks/useSetupStatus'
import { useAdminServices, useSaveService } from '../../../hooks/useAdminServices'
import { saveBusinessInfo, createOwnerBarber } from '../../../lib/repositories/setupRepository'
import { useAuth } from '../../../hooks/useAuth'

const BARBER_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass = 'border border-slate-300 rounded-xl px-4 py-3 mb-3 text-slate-900 bg-white'

export default function AdminSetupScreen() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const { signOut, profile } = useAuth()
    const { data: status, isLoading } = useSetupStatus(true)
    const { data: allServices = [] } = useAdminServices()
    const services = allServices.filter((s) => s.is_active)
    const saveService = useSaveService()

    const [busy, setBusy] = useState(false)
    const [business, setBusiness] = useState({ name: '', phone: '', email: '', address: '' })
    const [barberName, setBarberName] = useState(profile?.full_name ?? '')
    const [service, setService] = useState({ name_es: '', duration: '30', price: '' })

    if (isLoading || !status) {
        return (
            <View className='flex-1 items-center justify-center bg-slate-50'>
                <ActivityIndicator size='large' color='#0f172a' />
            </View>
        )
    }

    // Current step = first one not yet done (progress survives closing the app).
    const step = !status.businessDone ? 1 : !status.barberDone ? 2 : !status.serviceDone ? 3 : 4
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['setup-status'] })
    const fail = (e: unknown) => Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Inténtalo de nuevo.')

    const submitBusiness = async () => {
        const info = {
            name: business.name.trim(),
            phone: business.phone.trim(),
            email: business.email.trim(),
            address: business.address.trim(),
        }
        if (!info.name || !info.phone || !info.email || !info.address) {
            return Alert.alert('Faltan datos', 'Rellena nombre, teléfono, correo y dirección del negocio.')
        }
        if (!EMAIL_RE.test(info.email)) return Alert.alert('Correo no válido', 'Revisa el correo del negocio.')
        setBusy(true)
        try {
            await saveBusinessInfo(info)
            await queryClient.invalidateQueries({ queryKey: ['shop-settings'] })
            await refresh()
        } catch (e) {
            fail(e)
        } finally {
            setBusy(false)
        }
    }

    const submitBarber = async () => {
        const name = barberName.trim()
        if (!name) return Alert.alert('Falta el nombre', 'Escribe el nombre del barbero.')
        setBusy(true)
        try {
            if (!profile?.id) throw new Error('No se encontró tu perfil. Cierra sesión y vuelve a entrar.')
            await createOwnerBarber(profile.id, name, BARBER_COLORS[0])
            await queryClient.invalidateQueries({ queryKey: ['active-barbers'] })
            await refresh()
        } catch (e) {
            fail(e)
        } finally {
            setBusy(false)
        }
    }

    const submitService = async () => {
        const name_es = service.name_es.trim()
        const duration = Number(service.duration)
        const price = Number(service.price.replace(',', '.'))
        if (!name_es) return Alert.alert('Falta el nombre', 'Escribe el nombre del servicio.')
        if (!Number.isInteger(duration) || duration <= 0 || duration % 5 !== 0) {
            return Alert.alert('Duración no válida', 'La duración debe ser un múltiplo de 5 minutos.')
        }
        if (service.price.trim() === '' || !Number.isFinite(price) || price < 0) {
            return Alert.alert('Precio no válido', 'Escribe un precio en euros, por ejemplo 15 o 12,50.')
        }
        setBusy(true)
        try {
            await saveService.mutateAsync({
                values: { name_es, name_en: name_es, duration_minutes: duration, price, is_active: true },
            })
            await refresh()
        } catch (e) {
            fail(e)
        } finally {
            setBusy(false)
        }
    }

    const titles = ['', 'Datos del negocio', 'Tu ficha de barbero', 'Tu primer servicio', '¡Todo listo!']

    return (
        <KeyboardAvoidingView className='flex-1 bg-slate-50' behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className='px-5 pt-14 pb-4 bg-white border-b border-slate-200'>
                <Text className='text-xs font-semibold text-slate-500 mb-1'>
                    {step <= 3 ? `Configuración inicial · Paso ${step} de 3` : 'Configuración inicial'}
                </Text>
                <Text className='text-xl font-bold text-slate-900'>{titles[step]}</Text>
                <View className='flex-row mt-3'>
                    {[1, 2, 3].map((n) => (
                        <View
                            key={n}
                            className={`flex-1 h-1.5 rounded-full mr-1 ${step > n || step === 4 ? 'bg-slate-900' : step === n ? 'bg-blue-500' : 'bg-slate-200'}`}
                        />
                    ))}
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps='handled'>
                {step === 1 && (
                    <>
                        <Text className='text-slate-500 mb-4'>
                            Estos datos aparecen en las citas de tus clientes (calendario y mensajes).
                        </Text>
                        <Text className='text-sm font-medium text-slate-700 mb-1'>Nombre del negocio</Text>
                        <TextInput className={inputClass} value={business.name} placeholder='Barbería Ejemplo'
                            onChangeText={(v) => setBusiness((b) => ({ ...b, name: v }))} />
                        <Text className='text-sm font-medium text-slate-700 mb-1'>Teléfono</Text>
                        <TextInput className={inputClass} value={business.phone} placeholder='+34 600 000 000'
                            keyboardType='phone-pad' onChangeText={(v) => setBusiness((b) => ({ ...b, phone: v }))} />
                        <Text className='text-sm font-medium text-slate-700 mb-1'>Correo</Text>
                        <TextInput className={inputClass} value={business.email} placeholder='contacto@negocio.com'
                            keyboardType='email-address' autoCapitalize='none'
                            onChangeText={(v) => setBusiness((b) => ({ ...b, email: v }))} />
                        <Text className='text-sm font-medium text-slate-700 mb-1'>Dirección</Text>
                        <TextInput className={inputClass} value={business.address} placeholder='Calle, número, ciudad'
                            onChangeText={(v) => setBusiness((b) => ({ ...b, address: v }))} />
                        <PrimaryButton label='Continuar' busy={busy} onPress={submitBusiness} />
                    </>
                )}

                {step === 2 && (
                    <>
                        <Text className='text-slate-500 mb-4'>
                            Te añadimos como barbero para que los clientes puedan reservar contigo desde ya (horario de 09:00 a 21:00 todos los días, editable después). Puedes cambiar el nombre.
                        </Text>
                        <Text className='text-sm font-medium text-slate-700 mb-1'>Nombre del barbero</Text>
                        <TextInput className={inputClass} value={barberName} placeholder='Nombre'
                            onChangeText={setBarberName} />
                        <PrimaryButton label='Continuar' busy={busy} onPress={submitBarber} />
                    </>
                )}

                {step === 3 && (
                    <>
                        <Text className='text-slate-500 mb-4'>
                            Necesitas al menos un servicio para que los clientes puedan reservar.
                        </Text>
                        <Text className='text-sm font-medium text-slate-700 mb-1'>Nombre del servicio</Text>
                        <TextInput className={inputClass} value={service.name_es} placeholder='Corte de pelo'
                            onChangeText={(v) => setService((s) => ({ ...s, name_es: v }))} />
                        <View className='flex-row'>
                            <View className='flex-1 mr-2'>
                                <Text className='text-sm font-medium text-slate-700 mb-1'>Duración (min)</Text>
                                <TextInput className={inputClass} value={service.duration} keyboardType='number-pad'
                                    onChangeText={(v) => setService((s) => ({ ...s, duration: v }))} />
                            </View>
                            <View className='flex-1 ml-2'>
                                <Text className='text-sm font-medium text-slate-700 mb-1'>Precio (€)</Text>
                                <TextInput className={inputClass} value={service.price} keyboardType='decimal-pad'
                                    placeholder='15' onChangeText={(v) => setService((s) => ({ ...s, price: v }))} />
                            </View>
                        </View>
                        <PrimaryButton label='Terminar' busy={busy} onPress={submitService} />
                    </>
                )}

                {step === 4 && (
                    <>
                        <Text className='text-slate-500 mb-4'>
                            Ya tienes el negocio, un barbero y {services.length} servicio{services.length === 1 ? '' : 's'}. Puedes cambiarlo todo desde el panel.
                        </Text>
                        <PrimaryButton label='Ir al inicio' busy={false} onPress={() => router.replace('/(admin)')} />
                    </>
                )}

                <TouchableOpacity onPress={signOut} className='mt-6 items-center'>
                    <Text className='text-slate-500 text-sm'>Cerrar sesión</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

function PrimaryButton({ label, busy, onPress }: { label: string; busy: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} disabled={busy} className='bg-slate-900 rounded-xl py-4 items-center mt-2'>
            {busy ? <ActivityIndicator color='#ffffff' /> : <Text className='text-white font-semibold'>{label}</Text>}
        </TouchableOpacity>
    )
}
