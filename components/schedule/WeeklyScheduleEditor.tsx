import { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native'

import {
    useBarberSchedule,
    useUpsertScheduleBlock,
    useDeleteScheduleBlock,
} from '../../hooks/useBarberSchedules'
import type { BarberSchedule } from '../../types/database'
import { TimePickerSheet } from './TimePickerSheet'

// TODO: replace with a real shop-level setting (see pending items in #6/#9 follow-ups)
const SHOP_OPEN_HOUR = 9
const SHOP_CLOSE_HOUR = 21

const WEEKDAYS: { index: number; label: string }[] = [
    { index: 1, label: 'Lunes' },
    { index: 2, label: 'Martes' },
    { index: 3, label: 'Miércoles' },
    { index: 4, label: 'Jueves' },
    { index: 5, label: 'Viernes' },
    { index: 6, label: 'Sábado' },
    { index: 0, label: 'Domingo' },
]

const showError = (msg: string) => {
    Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg)
}

const showConfirm = (msg: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
        if (window.confirm(msg)) onConfirm()
        return
    }
    Alert.alert('Confirmar', msg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
    ])
}

type PickerTarget = {
    blockId: string
    field: 'start_time' | 'end_time'
} | null

type WeeklyScheduleEditorProps = {
    barberId: string
    // Optional label shown at the top (e.g. barber's name, for admin context)
    title?: string
}

export function WeeklyScheduleEditor({ barberId, title }: WeeklyScheduleEditorProps) {
    const { data: schedules = [], isLoading } = useBarberSchedule(barberId)
    const upsert = useUpsertScheduleBlock(barberId)
    const remove = useDeleteScheduleBlock(barberId)

    const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null)

    const activeBlock = schedules.find((s) => s.id === pickerTarget?.blockId) ?? null

    const handleAddBlock = (dayOfWeek: number) => {
        upsert.mutate(
            {
                barber_id: barberId,
                day_of_week: dayOfWeek,
                start_time: `${String(SHOP_OPEN_HOUR).padStart(2, '0')}:00:00`,
                end_time: `${String(SHOP_OPEN_HOUR + 1).padStart(2, '0')}:00:00`,
                is_day_off: false,
            },
            { onError: () => showError('No se pudo añadir la franja.') }
        )
    }

    const handleToggleType = (block: BarberSchedule) => {
        upsert.mutate(
            { ...block, is_day_off: !block.is_day_off },
            { onError: () => showError('No se pudo actualizar la franja.') }
        )
    }

    const handleTimeSelected = (time: string) => {
        if (!activeBlock || !pickerTarget) return

        const updated = { ...activeBlock, [pickerTarget.field]: time }

        if (updated.start_time >= updated.end_time) {
            showError('La hora de inicio debe ser anterior a la hora de fin.')
            return
        }

        upsert.mutate(updated, { onError: () => showError('No se pudo guardar la hora.') })
    }

    const handleDelete = (block: BarberSchedule) => {
        showConfirm('¿Eliminar esta franja horaria?', () => {
            remove.mutate(block.id, { onError: () => showError('No se pudo eliminar la franja.') })
        })
    }

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center py-10">
                <ActivityIndicator size="large" color="#0f172a" />
            </View>
        )
    }

    return (
        <View className="flex-1">
            {title && (
                <Text className="text-lg font-bold text-slate-900 px-5 pt-2 pb-1">{title}</Text>
            )}

            {WEEKDAYS.map((day) => {
                const dayBlocks = schedules
                    .filter((s) => s.day_of_week === day.index)
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))

                return (
                    <View key={day.index} className="mx-5 mb-4 bg-white border border-slate-200 rounded-2xl p-4">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-base font-bold text-slate-900">{day.label}</Text>
                            <TouchableOpacity
                                onPress={() => handleAddBlock(day.index)}
                                className="px-3 py-1.5 rounded-full bg-slate-900"
                            >
                                <Text className="text-white text-xs font-bold">+ Franja</Text>
                            </TouchableOpacity>
                        </View>

                        {dayBlocks.length === 0 ? (
                            <Text className="text-slate-400 text-sm">Sin horario · día libre</Text>
                        ) : (
                            dayBlocks.map((block) => (
                                <View
                                    key={block.id}
                                    className="flex-row items-center justify-between mb-2 last:mb-0"
                                >
                                    <View className="flex-row items-center gap-2">
                                        <TouchableOpacity
                                            onPress={() => setPickerTarget({ blockId: block.id, field: 'start_time' })}
                                            className="px-3 py-2 rounded-lg bg-slate-100"
                                        >
                                            <Text className="text-sm font-bold text-slate-900">
                                                {block.start_time.slice(0, 5)}
                                            </Text>
                                        </TouchableOpacity>
                                        <Text className="text-slate-400">—</Text>
                                        <TouchableOpacity
                                            onPress={() => setPickerTarget({ blockId: block.id, field: 'end_time' })}
                                            className="px-3 py-2 rounded-lg bg-slate-100"
                                        >
                                            <Text className="text-sm font-bold text-slate-900">
                                                {block.end_time.slice(0, 5)}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex-row items-center gap-2">
                                        <TouchableOpacity
                                            onPress={() => handleToggleType(block)}
                                            className={`px-3 py-1.5 rounded-full border ${block.is_day_off
                                                    ? 'bg-amber-100 border-amber-300'
                                                    : 'bg-green-100 border-green-300'
                                                }`}
                                        >
                                            <Text
                                                className={`text-xs font-bold ${block.is_day_off ? 'text-amber-700' : 'text-green-700'
                                                    }`}
                                            >
                                                {block.is_day_off ? 'Descanso' : 'Trabajo'}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => handleDelete(block)} className="p-2">
                                            <Text className="text-red-500 font-bold">✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )
            })}

            <TimePickerSheet
                visible={!!pickerTarget}
                value={activeBlock ? activeBlock[pickerTarget!.field] : null}
                rangeStartHour={SHOP_OPEN_HOUR}
                rangeEndHour={SHOP_CLOSE_HOUR}
                onSelect={handleTimeSelected}
                onClose={() => setPickerTarget(null)}
            />
        </View>
    )
}