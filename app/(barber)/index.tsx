import { useState } from "react"
import { View, Text, Modal, TouchableOpacity, Pressable, ScrollView } from "react-native"
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { useAuth } from "../../hooks/useAuth"
import { useAppointments } from "../../hooks/useAppointments"
import { useBarbers } from "../../hooks/useBarbers"
import SideMenu from "../../components/ui/SideMenu"
import MenuButton from "../../components/ui/MenuButton"
import { TimeGrid } from "../../components/calendar/TimeGrid"
import { BarberColumn } from "../../components/calendar/BarberColumn"

import type { AppointmentWithRelations } from "../../types/app"
import type { appointment_status } from "../../types/database"

type ViewMode = 'day' | 'week' | 'month'

export const statusConfig: Partial<Record<appointment_status, { label: string; bg: string; text: string; border: string }>> = {
  confirmed: { label: 'Confirmada', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-600' },
  completed: { label: 'Completada', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-600' },
  cancelled: { label: 'Cancelada', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-600' },
  no_show: { label: 'No show', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-400' },
}

// Visual FallBack if residual 'pending' from DB...
export const getStatusTheme = (status: appointment_status) => {
  return statusConfig[status] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300'
  }
}

export default function BarberDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null)
  const [selectedBarberIds, setSelectedBarberIds] = useState<string[]>([])

  const { profile } = useAuth()
  const { appointments, isLoading, changeStatus, isChangingStatus } = useAppointments(selectedDate, viewMode)
  const { data: barbers = [] } = useBarbers()

  // Mavigation helpers
  const goBack = () => {
    if (viewMode === 'day') setSelectedDate(d => subDays(d, 1))
    if (viewMode === 'week') setSelectedDate(d => subWeeks(d, 1))
    if (viewMode === 'month') setSelectedDate(d => subMonths(d, 1))
  }

  const goForward = () => {
    if (viewMode === 'day') setSelectedDate(d => addDays(d, 1))
    if (viewMode === 'week') setSelectedDate(d => addWeeks(d, 1))
    if (viewMode === 'month') setSelectedDate(d => addMonths(d, 1))
  }

  const dateLabel = () => {
    if (viewMode === 'day') return format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
    if (viewMode === 'week') {
      const start = format(selectedDate, 'd MMM', { locale: es })
      const end = format(addDays(selectedDate, 6), 'd MMM', { locale: es })
      return `${start} — ${end}`
    }
    return format(selectedDate, 'MMMM yyyy', { locale: es })
  }

  const activeBarbers = barbers.filter(b =>
    selectedBarberIds.length === 0 || selectedBarberIds.includes(b.id)
  )

  return (
    <View className='flex-1 bg-slate-50'>
      <SideMenu />

      {/* Header */}
      <View className='flex-row justify-between items-center px-4 pt-12 pb-4 bg-white border-b border-slate-200 z-10'>
        <MenuButton />
        <Text className='text-lg font-bold text-slate-900'>Mi Agenda</Text>
        <View className='w-8' />
      </View>

      {/* Greeting */}
      <View className='px-4 pt-4 pb-2 z-10'>
        <Text className='text-slate-500 text-sm'>Bienvenido,</Text>
        <Text className='text-2x1 font-bold text-slate-900'>{profile?.full_name ?? 'Barbero'}</Text>
      </View>

      {/* View mode selector */}
      <View className='flex-row mx-4 mb-3 bg-slate-200/50 rounded-xl p-1 z-10'>
        {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            className={`flex-1 py-2 rounded-lg items-center ${viewMode === mode ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setViewMode(mode)}
          >
            <Text className={`text-sm font-medium ${viewMode === mode ? 'text-slate-900' : 'text-slate-500'}`}>
              {mode === 'day' ? 'Hoy' : mode === 'week' ? 'Semana' : 'Mes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date navigator */}
      <View className='flex-row items-center justify-between px-4 mb-3 z-10'>
        <TouchableOpacity onPress={goBack} className='p-2 bg-white rounded-full shadow-sm'>
          <Text className='text-slate-600 font-bold'>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
          <Text className='text-sm font-bold text-slate-800 capitalize'>{dateLabel()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goForward} className='p-2 bg-white rounded-full shadow-sm'>
          <Text className='text-slate-600 font-bold'>›</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Body */}
      {isLoading ? (
        <View className='flex-1 items-center justify-center'>
          <Text className='text-slate-400'>Cargando agenda...</Text>
        </View>

      ) : viewMode === 'day' ? (

        <ScrollView className='flex-1 bg-white' contentContainerStyle={{ paddingBottom: 40 }}>
          <View className='flex-row'>

            <TimeGrid />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex-1'>
              <View className='flex-row relative'>
                <View className='absolute inset-0 top-[48px] z-0 pointer-events-none'>
                  {Array.from({ length: 15 }).map((_, i) => (
                    <View key={i} style={{ top: i * 60 * 1.5, position: 'absolute' }} className='w-full h-[1px] bg-slate-100' />
                  ))}
                </View>

                <View className='flex-row z-10'>
                  {activeBarbers.map(barber => {
                    const barberAppointments = (appointments || []).filter(a => a.barber_id === barber.id)
                    return (
                      <BarberColumn
                        key={barber.id}
                        barberName={barber.name}
                        appointments={barberAppointments}
                        onPressAppointment={(apt) => setSelectedAppointment(apt as AppointmentWithRelations)}
                      />
                    )
                  })}
                </View>

              </View>
            </ScrollView>

          </View>
        </ScrollView>

      ) : (
        <View className='flex-1 items-center justify-center bg-white'>
          <Text className='text-4xl mb-3'>📅</Text>
          {/* PENDING: Implement view on 'week', 'month'... */}
          <Text className='text-slate-500 font-medium'>Vista multi-columna solo disponible en 'hoy'</Text>
        </View>
      )}

      {/* MODAL: Edit appointment state */}
      <Modal
        visible={!!selectedAppointment}
        transparent
        animationType='slide'
        onRequestClose={() => setSelectedAppointment(null)}
      >
        <Pressable className='flex-1 justify-end bg-black/50' onPress={() => setSelectedAppointment(null)}>
          <Pressable className='bg-white p-5 rounded-t-3x1 pb-10' onPress={(e) => e.stopPropagation()}>
            <View className='flex-row justify-between items-start mb-6'>
              <View>
                <Text className='text-xl font-bold text-slate-900'>
                  {selectedAppointment?.client?.full_name}
                </Text>
                <Text className='text-slate-500'>
                  {selectedAppointment?.service?.name_es} • {selectedAppointment?.service?.duration_minutes} min | {selectedAppointment?.barber?.name}
                </Text>
              </View>
              {selectedAppointment && (
                <View className={`px-3 py-1 rounded-full ${getStatusTheme(selectedAppointment.status).bg}`}>
                  <Text className={`text-xs font-bold ${getStatusTheme(selectedAppointment.status).text}`}>
                    {getStatusTheme(selectedAppointment.status).label}
                  </Text>
                </View>
              )}
            </View>

            <Text className='text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider'>
              Cambiar estado a:
            </Text>

            {/* PENDING: extract state filtering to other file */}
            {Object.entries(statusConfig)
              .filter(([status]) => status !== selectedAppointment?.status)
              .map(([status, config]) => (
                <TouchableOpacity
                  key={status}
                  disabled={isChangingStatus}
                  className={`py-4 px-4 rounded-xl mb-3 border ${config.bg} ${config.border} ${isChangingStatus ? 'opacity-50' : ''}`}
                  onPress={() => {
                    if (selectedAppointment) {
                      changeStatus({ id: selectedAppointment.id, status: status as appointment_status })
                      setSelectedAppointment(null)
                    }
                  }}
                >
                  <Text className={`text-base font-bold ${config.text} text-center`}>
                    Marcar como {config.label}
                  </Text>
                </TouchableOpacity>
              ))
            }
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  )
}