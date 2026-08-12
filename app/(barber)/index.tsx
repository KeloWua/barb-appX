import { useMemo, useState } from 'react'
import { View, Text, Modal, TouchableOpacity, Pressable, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native'
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, isSameDay, startOfWeek, endOfWeek } from "date-fns"
import { es } from 'date-fns/locale'
import { useQueryClient } from '@tanstack/react-query'

import { useAuth } from '../../hooks/useAuth'
import { useAppointments } from '../../hooks/useAppointments'
import { useBarbers } from '../../hooks/useBarbers'
import { useShopSettings } from '../../hooks/useShopSettings'
import { createProvisionalHold } from '../../lib/repositories/appointmentRepository'

import SideMenu from '../../components/ui/SideMenu'
import MenuButton from '../../components/ui/MenuButton'


import { TimeGrid } from '../../components/calendar/TimeGrid'
import { BarberColumn } from '../../components/calendar/BarberColumn'
import { CalendarGridLines } from '../../components/calendar/CalendarGridLines'
import { CreateAppointmentModal } from '../../components/calendar/CreateAppointmentModal'
import type { AppointmentWithRelations } from '../../types/app'
import type { appointment_status } from '../../types/database'
import { DEFAULT_TIMEZONE } from '../../lib/calendarUtils'

type ViewMode = 'day' | 'week' | 'month'

export const statusConfig: Partial<Record<appointment_status, { label: string; bg: string; text: string; border: string }>> = {
  confirmed: { label: 'Confirmada', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-600' },
  completed: { label: 'Completada', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-600' },
  cancelled: { label: 'Cancelada', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-600' },
  no_show: { label: 'No show', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-400' },
}

export const getStatusTheme = (status: appointment_status) => {
  return statusConfig[status] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300'
  }
}


export default function BarberDashboard() {
  const { data: shopSettings } = useShopSettings()
  const timezone = shopSettings?.timezone ?? DEFAULT_TIMEZONE

  // shop_settings.opening_time / closing_time are Postgres `time` columns > "09:00:00"
  const openHour = shopSettings ? parseInt(shopSettings.opening_time.split(':')[0], 10) : 9
  const closeHour = shopSettings ? parseInt(shopSettings.closing_time.split(':')[0], 10) : 21

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null)
  const [selectedBarberIds, setSelectedBarberIds] = useState<string[]>([])
  const [manualHold, setManualHold] = useState<{ id: string; slotStart: Date } | null>(null)

  const queryClient = useQueryClient()
  const { profile } = useAuth()

  // false = we want to see the 'Extras' dummy barber in the dashboard
  const { data: barbers = [] } = useBarbers(false)
  const { appointments, isLoading, changeStatus, isChangingStatus } = useAppointments(selectedDate, viewMode)

  const activeBarbers = barbers.filter(b =>
    selectedBarberIds.length === 0 || selectedBarberIds.includes(b.id)
  )

  const handleEmptySlotPress = async (barberId: string, slotStart: Date) => {
    if (!profile?.id) return
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000)

    const { data, error } = await createProvisionalHold({
      barber_id: barberId,
      start_time: slotStart.toISOString(),
      end_time: slotEnd.toISOString(),
      created_by: profile.id,
    })

    if (error || !data) {
      console.error(error)
      const msg = (error as any)?.code === '23P01' ? 'Ese hueco ya está ocupado.' : 'No se pudo crear la cita.'
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg)
      return
    }

    setManualHold({ id: data.id, slotStart })
  }

  // Navigation helpers
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
      const monday = startOfWeek(selectedDate, { weekStartsOn: 1 })
      const sunday = endOfWeek(selectedDate, { weekStartsOn: 1 })
      return `${format(monday, 'd MMM', { locale: es })} — ${format(sunday, 'd MMM', { locale: es })}`
    }
    return format(selectedDate, 'MMMM yyyy', { locale: es })
  }

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
        <Text className='text-2xl font-bold text-slate-900'>{profile?.full_name ?? 'Barbero'}</Text>
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

      {/* Barbers Filter */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-3">
          <TouchableOpacity
            onPress={() => setSelectedBarberIds([])}
            className={`mr-2 px-4 py-2 rounded-full ${selectedBarberIds.length === 0 ? "bg-slate-900" : "bg-slate-200"}`}
          >
            <Text className={selectedBarberIds.length === 0 ? "text-white" : "text-slate-700"}>
              Todos
            </Text>
          </TouchableOpacity>

          {barbers.map(barber => {
            const selected = selectedBarberIds.includes(barber.id)
            return (
              <TouchableOpacity
                key={barber.id}
                onPress={() =>
                  setSelectedBarberIds(ids => selected ? ids.filter(id => id !== barber.id) : [...ids, barber.id])
                }
                className={`mr-2 px-4 py-2 rounded-full ${selected ? "bg-slate-900" : "bg-slate-200"}`}
              >
                <Text className={selected ? "text-white" : "text-slate-700"}>
                  {barber.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
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
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : viewMode === 'day' ? (

        <ScrollView className='flex-1 bg-white' contentContainerStyle={{ paddingBottom: 40 }}>
          <View className='flex-row'>

            {/* Time Grid (Left Rules) */}
            <TimeGrid startHour={openHour} endHour={closeHour} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex-1'>
              <View className='flex-row relative'>

                {/* Background Zebra Lines */}
                <CalendarGridLines
                  columnsCount={activeBarbers.length}
                  startHour={openHour}
                  endHour={closeHour}
                />

                <View className='flex-row z-10'>
                  {activeBarbers.map(barber => {
                    const barberAppointments = (appointments || []).filter(a => a.barber_id === barber.id)
                    return (
                      <BarberColumn
                        key={barber.id}
                        barberName={barber.name}
                        appointments={barberAppointments}
                        date={selectedDate}
                        startHour={openHour}
                        endHour={closeHour}
                        timezone={timezone}
                        onPressAppointment={(apt) => setSelectedAppointment(apt as AppointmentWithRelations)}
                        onPressEmptySlot={(slotStart) => handleEmptySlotPress(barber.id, slotStart)}
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
          <Pressable className='bg-white p-5 rounded-t-3xl pb-10' onPress={(e) => e.stopPropagation()}>
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

      {/* MODAL: Create Appointment */}
      <CreateAppointmentModal
        visible={!!manualHold}
        holdId={manualHold?.id ?? null}
        slotStart={manualHold?.slotStart ?? null}
        timezone={timezone}
        onClose={() => setManualHold(null)}
        onSaved={() => {
          setManualHold(null)
          queryClient.invalidateQueries({ queryKey: ['appointments'] })
        }}
      />

    </View>
  )
}