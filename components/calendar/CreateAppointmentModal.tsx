import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, Pressable, Platform, Alert } from 'react-native'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useServices } from '../../hooks/useServices'
import { useCustomerSearch } from '../../hooks/useCustomerSearch'
import { finalizeManualAppointment, releaseAppointmentHold } from '../../lib/repositories/appointmentRepository'
import type { Service } from '../../types/database'

interface Props {
    visible: boolean
    holdId: string | null
    slotStart: Date | null
    onClose: () => void
    onSaved: () => void
}

export function CreateAppointmentModal({ visible, holdId, slotStart, onClose, onSaved }: Props) {
    const { data: services = [] } = useServices()
    const { search, setSearch, results, isLoading, createWalkinClient } = useCustomerSearch()

    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedClient, setSelectedClient] = useState<{ id: string; full_name: string } | null>(null)
    const [note, setNote] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const reset = () => {
        setSelectedService(null)
        setSelectedClient(null)
        setNote('')
        setSearch('')
    }

    const handleClose = async () => {
        if (holdId) {
            try { await releaseAppointmentHold(holdId) } catch {}
        }
        reset()
        onClose()
    }

    const handleWalkinQuick = async () => {
        const name = `Walk-in ${format(new Date(), 'HH:mm')}`
        const client = await createWalkinClient.mutateAsync({ full_name: name })
        setSelectedClient({ id: client.id, full_name: client.full_name })
    }

    const handleSave = async () => {
        if (!holdId || !slotStart || !selectedService || !selectedClient) return

        setIsSaving(true)
        const end = new Date(slotStart.getTime() + selectedService.duration_minutes * 60000)

        const { error } = await finalizeManualAppointment(holdId, {
            client_id: selectedClient.id,
            service_id: selectedService.id,
            start_time: slotStart.toISOString(),
            end_time: end.toISOString(),
            notes: note.trim() || null,
        })

        setIsSaving(false)

        if (error) {
            const msg = (error as any).code === '23P01'
                ? 'Ese horario ya no está libre.'
                : 'No se pudo guardar la cita.'
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg)
            return
        }
        reset()
        onSaved()
    }

    if (!visible || !slotStart) return null

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <Pressable className="flex-1 justify-end bg-black/50" onPress={handleClose}>
                <Pressable className="bg-white p-5 rounded-t-3xl pb-10 max-h-[85%]" onPress={(e) => e.stopPropagation()}>
                    <Text className="text-xl font-bold text-slate-900 mb-1">Nueva cita</Text>
                    <Text className="text-slate-500 mb-6">
                        {format(slotStart, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                    </Text>

                    <Text className="text-sm font-semibold text-slate-400 mb-2 uppercase">Servicio</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {services.map((s) => (
                            <TouchableOpacity
                                key={s.id}
                                onPress={() => setSelectedService(s)}
                                className={`px-3 py-2 rounded-full border ${
                                    selectedService?.id === s.id ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                                }`}
                            >
                                <Text className={selectedService?.id === s.id ? 'text-white' : 'text-slate-700'}>
                                    {s.name_es} ({s.duration_minutes}min)
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-sm font-semibold text-slate-400 mb-2 uppercase">Cliente</Text>

                    {selectedClient ? (
                        <View className="flex-row justify-between items-center bg-slate-100 rounded-xl px-4 py-3 mb-4">
                            <Text className="font-bold text-slate-900">{selectedClient.full_name}</Text>
                            <TouchableOpacity onPress={() => setSelectedClient(null)}>
                                <Text className="text-slate-500">Cambiar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <TextInput
                                value={search}
                                onChangeText={setSearch}
                                placeholder="Buscar por nombre o teléfono"
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-2"
                            />
                            {isLoading && <ActivityIndicator className="mb-2" />}
                            {results.map((c: any) => (
                                <TouchableOpacity
                                    key={c.id}
                                    onPress={() => setSelectedClient(c)}
                                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-2"
                                >
                                    <Text className="font-bold text-slate-900">{c.full_name}</Text>
                                    <Text className="text-slate-500 text-sm">{c.phone}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                onPress={handleWalkinQuick}
                                disabled={createWalkinClient.isPending}
                                className="py-3 items-center border border-dashed border-slate-300 rounded-xl mb-4"
                            >
                                <Text className="text-slate-700 font-bold">
                                    {createWalkinClient.isPending ? 'Creando...' : '+ Walk-in rápido'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <Text className="text-sm font-semibold text-slate-400 mb-2 uppercase">Nota (opcional)</Text>
                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder='Ej: "Para: Manu"'
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6"
                    />

                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!selectedService || !selectedClient || isSaving}
                        className={`rounded-2xl py-4 items-center ${
                            selectedService && selectedClient ? 'bg-slate-900' : 'bg-slate-300'
                        }`}
                    >
                        <Text className="text-white font-bold">
                            {isSaving ? 'Guardando...' : 'Guardar cita'}
                        </Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    )
}