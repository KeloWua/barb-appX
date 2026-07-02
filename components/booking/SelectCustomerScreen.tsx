import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useCustomerSearch } from '../../hooks/useCustomerSearch'
import { useBookingStore } from '../../stores/bookingStore'

export default function SelectCustomerScreen() {
    const router = useRouter()
    const { search, setSearch, results, isLoading, createCustomer } = useCustomerSearch()
    const setCustomer = useBookingStore((s) => s.setCustomer)

    const [showNewForm, setShowNewForm] = useState(false)
    const [newName, setNewName] = useState('')
    const [newPhone, setNewPhone] = useState('')

    const goNext = (id: string, name: string) => {
        setCustomer(id, name)
        router.push('/appointments/select-datetime')
    }

    const handleCreate = async () => {
        if (!newName.trim() || !newPhone.trim()) return
        const customer = await createCustomer.mutateAsync({ fullName: newName, phone: newPhone })
        goNext(customer.id, customer.full_name)
    }

    return (
        <View className='flex-1 bg-slate-50 px-5 pt-6'>
            <Text className='text-lg font-bold text-slate-900 mb-4'>¿Para quién es la cita?</Text>
            <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder='Buscar por nombre o teléfono'
                className='bg-white border border-slate-200 rounded-xl px-4 py-3 mb-4'
            />

            {isLoading && <ActivityIndicator className='mt-4' />}

            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => goNext(item.id, item.full_name)}
                        className='bg-white border border-slate-200 rounded-xl px-4 py-3 mb-2'
                    >
                        <Text className='font-bold text-slate-900'>{item.full_name}</Text>
                        <Text className='text-slate-500 text-sm'>{item.phone}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    search.trim().length >= 2 && !isLoading ? (
                        <Text className='text-slate-900 text-center mt-2'>Sin resultados</Text>
                    ) : null
                }
            />

            {!showNewForm ? (
                <TouchableOpacity
                    onPress={() => setShowNewForm(true)}
                    className='mt-4 py-3 items-center border border-dashed border-slate-300 rounded-xl'
                >
                    <Text className='text-slate-700 font-bold'>+ Cliente nuevo</Text>
                </TouchableOpacity>
            ) : (
                <View className='mt-4 bg-white border border-slate-200 rounded-xl p-4'>
                    <TextInput
                        value={newName}
                        onChangeText={setNewName}
                        placeholder='Nombre completo'
                        className='border-b border-slate-100 py-2 mb-2'
                    />
                    <TextInput
                        value={newPhone}
                        onChangeText={setNewPhone}
                        placeholder='Teléfono'
                        keyboardType='phone-pad'
                        className='border-b border-slate-100 py-2 mb-4'
                    />
                    <TouchableOpacity
                        onPress={handleCreate}
                        disabled={createCustomer.isPending}
                        className='bg-slate-900 rounded-xl py-3 items-center'
                    >
                        <Text className='text-white font-bold'>
                            {createCustomer.isPending ? 'Creando...' : 'Crear y continuar'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}