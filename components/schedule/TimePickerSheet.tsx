import { useMemo, useState } from 'react'
import { View, Text, Modal, TouchableOpacity, Pressable, ScrollView } from 'react-native'

type TimePickerSheetProps = {
    visible: boolean
    value: string | null // "HH:mm:ss"
    rangeStartHour?: number // default range shown first (e.g. shop open hour)
    rangeEndHour?: number   // default range shown first (e.g. shop close hour)
    stepMinutes?: number
    onSelect: (time: string) => void
    onClose: () => void
}

// Generates "HH:mm:ss" options between two hours (24h clock, wraps not supported)
const generateTimeOptions = (startHour: number, endHour: number, stepMinutes: number): string[] => {
    const options: string[] = []
    let totalMinutes = startHour * 60
    const limit = endHour * 60

    while (totalMinutes <= limit) {
        const h = Math.floor(totalMinutes / 60)
        const m = totalMinutes % 60
        options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
        totalMinutes += stepMinutes
    }
    return options
}

const formatDisplay = (time: string) => time.slice(0, 5) // "HH:mm:ss" -> "HH:mm"

export function TimePickerSheet({
    visible,
    value,
    rangeStartHour = 9,
    rangeEndHour = 21,
    stepMinutes = 30,
    onSelect,
    onClose,
}: TimePickerSheetProps) {
    const [showAllHours, setShowAllHours] = useState(false)

    const options = useMemo(() => {
        return showAllHours
            ? generateTimeOptions(0, 23.5, stepMinutes)
            : generateTimeOptions(rangeStartHour, rangeEndHour, stepMinutes)
    }, [showAllHours, rangeStartHour, rangeEndHour, stepMinutes])

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
                <Pressable className="bg-white rounded-t-3xl pb-6 max-h-[70%]" onPress={(e) => e.stopPropagation()}>
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1 rounded-full bg-slate-200" />
                    </View>

                    <View className="px-5 pb-3 flex-row justify-between items-center">
                        <Text className="text-base font-bold text-slate-900">Elige una hora</Text>
                        <TouchableOpacity onPress={() => setShowAllHours((v) => !v)}>
                            <Text className="text-sm font-semibold text-slate-500 underline">
                                {showAllHours ? 'Ver horario habitual' : 'Ver todas las horas'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="px-5">
                        <View className="flex-row flex-wrap gap-2 pb-4">
                            {options.map((time) => {
                                const selected = time === value
                                return (
                                    <TouchableOpacity
                                        key={time}
                                        onPress={() => {
                                            onSelect(time)
                                            onClose()
                                        }}
                                        className={`px-4 py-2 rounded-xl border ${selected ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <Text className={`text-sm font-bold ${selected ? 'text-white' : 'text-slate-700'}`}>
                                            {formatDisplay(time)}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </ScrollView>

                    <View className="px-5 pt-1">
                        <TouchableOpacity onPress={onClose} className="py-3 items-center rounded-xl bg-slate-100">
                            <Text className="font-bold text-slate-700">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}