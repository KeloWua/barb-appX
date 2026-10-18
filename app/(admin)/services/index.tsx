import { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Modal,
    Switch,
    Alert,
    ScrollView,
} from 'react-native'

import { useAdminServices, useSaveService } from '../../../hooks/useAdminServices'
import SideMenu from '../../../components/ui/SideMenu'
import MenuButton from '../../../components/ui/MenuButton'
import type { Service } from '../../../types/database'

type FormState = {
    id?: string
    name_es: string
    name_en: string
    duration_minutes: string
    price: string
    is_active: boolean
}

const EMPTY_FORM: FormState = {
    name_es: '',
    name_en: '',
    duration_minutes: '30',
    price: '',
    is_active: true,
}

export default function AdminServicesScreen() {
    const { data: services = [], isLoading } = useAdminServices()
    const saveService = useSaveService()
    const [form, setForm] = useState<FormState | null>(null)

    const openNew = () => setForm({ ...EMPTY_FORM })
    const openEdit = (s: Service) =>
        setForm({
            id: s.id,
            name_es: s.name_es,
            name_en: s.name_en,
            duration_minutes: String(s.duration_minutes),
            price: String(s.price),
            is_active: s.is_active,
        })

    const handleSave = async () => {
        if (!form) return
        const name_es = form.name_es.trim()
        const name_en = form.name_en.trim() || name_es
        const duration = Number(form.duration_minutes)
        const price = Number(form.price.replace(',', '.'))

        if (!name_es) return Alert.alert('Falta el nombre', 'Escribe el nombre del servicio.')
        if (!Number.isInteger(duration) || duration <= 0 || duration % 5 !== 0) {
            return Alert.alert('Duración no válida', 'La duración debe ser un número de minutos múltiplo de 5.')
        }
        if (form.price.trim() === '' || !Number.isFinite(price) || price < 0) {
            return Alert.alert('Precio no válido', 'Escribe un precio en euros, por ejemplo 15 o 12,50.')
        }

        try {
            await saveService.mutateAsync({
                id: form.id,
                values: { name_es, name_en, duration_minutes: duration, price, is_active: form.is_active },
            })
            setForm(null)
        } catch (e) {
            Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Inténtalo de nuevo.')
        }
    }

    const toggleActive = async (s: Service) => {
        try {
            await saveService.mutateAsync({
                id: s.id,
                values: {
                    name_es: s.name_es,
                    name_en: s.name_en,
                    duration_minutes: s.duration_minutes,
                    price: s.price,
                    is_active: !s.is_active,
                },
            })
        } catch (e) {
            Alert.alert('No se pudo actualizar', e instanceof Error ? e.message : 'Inténtalo de nuevo.')
        }
    }

    return (
        <View className='flex-1 bg-slate-50'>
            <SideMenu />

            <View className='flex-row justify-between items-center px-4 pt-12 pb-4 bg-white border-b border-slate-200'>
                <MenuButton />
                <Text className='text-lg font-bold text-slate-900'>Servicios</Text>
                <TouchableOpacity onPress={openNew} className='px-3 py-2 rounded-full bg-slate-900'>
                    <Text className='text-white text-xs font-bold'>＋ Nuevo</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className='flex-1 items-center justify-center'>
                    <ActivityIndicator size='large' color='#0f172a' />
                </View>
            ) : (
                <FlatList
                    data={services}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <View
                            className={`bg-white border border-slate-200 rounded-xl px-4 py-4 mb-3 ${
                                item.is_active ? '' : 'opacity-60'
                            }`}
                        >
                            <View className='flex-row justify-between items-start'>
                                <View className='flex-1 pr-3'>
                                    <Text className='font-bold text-slate-900 text-base'>{item.name_es}</Text>
                                    <Text className='text-slate-500 text-sm mt-1'>
                                        {item.duration_minutes} min · {item.price}€
                                    </Text>
                                    {!item.is_active && (
                                        <Text className='text-xs text-red-600 font-semibold mt-1'>Desactivado</Text>
                                    )}
                                </View>
                                <TouchableOpacity
                                    onPress={() => openEdit(item)}
                                    className='px-4 py-2 rounded-full bg-slate-900'
                                >
                                    <Text className='text-white text-xs font-bold'>✏️ Editar</Text>
                                </TouchableOpacity>
                            </View>
                            <View className='flex-row items-center justify-between mt-3 pt-3 border-t border-slate-100'>
                                <Text className='text-sm text-slate-700'>Visible para clientes</Text>
                                <Switch
                                    value={item.is_active}
                                    onValueChange={() => toggleActive(item)}
                                    disabled={saveService.isPending}
                                />
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text className='text-slate-500 text-center mt-10'>No hay servicios creados.</Text>
                    }
                />
            )}

            <Modal visible={form !== null} transparent animationType='slide' onRequestClose={() => setForm(null)}>
                <View className='flex-1 bg-black/50 justify-end'>
                    <View className='bg-white rounded-t-2xl px-5 pt-5 pb-8 max-h-[90%]'>
                        <ScrollView keyboardShouldPersistTaps='handled'>
                            <Text className='text-lg font-bold text-slate-900 mb-4'>
                                {form?.id ? 'Editar servicio' : 'Nuevo servicio'}
                            </Text>

                            <Text className='text-sm font-medium text-slate-700 mb-1'>Nombre (español)</Text>
                            <TextInput
                                value={form?.name_es ?? ''}
                                onChangeText={(v) => setForm((f) => (f ? { ...f, name_es: v } : f))}
                                placeholder='Corte de pelo'
                                className='border border-slate-300 rounded-xl px-4 py-3 mb-3 text-slate-900'
                            />

                            <Text className='text-sm font-medium text-slate-700 mb-1'>Nombre (inglés)</Text>
                            <TextInput
                                value={form?.name_en ?? ''}
                                onChangeText={(v) => setForm((f) => (f ? { ...f, name_en: v } : f))}
                                placeholder='Haircut'
                                className='border border-slate-300 rounded-xl px-4 py-3 mb-3 text-slate-900'
                            />

                            <View className='flex-row'>
                                <View className='flex-1 mr-2'>
                                    <Text className='text-sm font-medium text-slate-700 mb-1'>Duración (min)</Text>
                                    <TextInput
                                        value={form?.duration_minutes ?? ''}
                                        onChangeText={(v) => setForm((f) => (f ? { ...f, duration_minutes: v } : f))}
                                        keyboardType='number-pad'
                                        className='border border-slate-300 rounded-xl px-4 py-3 mb-3 text-slate-900'
                                    />
                                </View>
                                <View className='flex-1 ml-2'>
                                    <Text className='text-sm font-medium text-slate-700 mb-1'>Precio (€)</Text>
                                    <TextInput
                                        value={form?.price ?? ''}
                                        onChangeText={(v) => setForm((f) => (f ? { ...f, price: v } : f))}
                                        keyboardType='decimal-pad'
                                        placeholder='15'
                                        className='border border-slate-300 rounded-xl px-4 py-3 mb-3 text-slate-900'
                                    />
                                </View>
                            </View>

                            <View className='flex-row items-center justify-between mb-5'>
                                <Text className='text-sm text-slate-700'>Visible para clientes</Text>
                                <Switch
                                    value={form?.is_active ?? true}
                                    onValueChange={(v) => setForm((f) => (f ? { ...f, is_active: v } : f))}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={saveService.isPending}
                                className='bg-slate-900 rounded-xl py-4 items-center mb-3'
                            >
                                {saveService.isPending ? (
                                    <ActivityIndicator color='#ffffff' />
                                ) : (
                                    <Text className='text-white font-semibold'>Guardar</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setForm(null)}
                                className='border border-slate-200 rounded-xl py-4 items-center'
                            >
                                <Text className='text-slate-700 font-semibold'>Cancelar</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}
