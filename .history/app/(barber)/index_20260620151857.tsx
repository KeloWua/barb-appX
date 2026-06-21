import React, { useState } from 'react'
import { View, Text, FlatList, Modal, TouchableOpacity } from 'react-native'
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns'
import { bg, es } from 'date-fns/locale'
import { useAuth } from '../../hooks/useAuth'
import { useAppointments } from '../../hooks/useAppointments'
import SideMenu from '../../components/ui/SideMenu'
import MenuButton from '../../components/ui/MenuButton'
import type { AppointmentWithRelations } from '../../types/app'
import type { appointment_status } from '../../types/database'

type ViewMode = 'day' | 'week' | 'month'

// Status badge color helper
const statusConfig: Record<appointment_status, { label: string; bg: string; text: string }> = {
  confirmed: { label: 'Confirmada', bg: 'bg-blue-100', text: 'text-blue-700' },
  completed: { label: 'Completada', bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { label: 'Cancelada', bg: 'bg-red-100', text: 'text-red-700' },
  no_show: { label: 'No show', bg: 'bg-slate-100', text: 'text-slate-500' },
}

// Single appointment card ( can be a component in future )
function AppointmentCard({
  item,
  onChangeStatus,
  isChangingStatus
}: {
  item: AppointmentWithRelations
  onChangeStatus: (
    id: string,
    status: appointment_status
  ) => void
  isChangingStatus: boolean
}) {
  const status = statusConfig[item.status]
  const barberColor = item.barber?.color_code ?? '#3b82f6'
  const [showStatusModal, setShowStatusModal] = useState(false)

  return (
    <View className='bg-white rounded-x1 border border-slate-200 mb-3 overflow-hidden flex-row'>
      {/* Color stripe */}
      <View
        style={{ backgroundColor: barberColor, width: 6 }}
      />
      <View className='flex-1 p-4'>
        {/* Time + client */}
        <View className='flex-row justify-between items-center mb-2'>
          <View className='bg-slate-900 rounded-lg px-3 py-1'>
            <Text className='text-white font-bold text-sm'>
              {format(new Date(item.start_time), 'HH:mm')} — {format(new Date(item.end_time), 'HH:mm')}
            </Text>
          </View>
          <View className={`rounded-full px-3 py-1 ${status.bg}`}>
            <Text className={`text-xs font-medium ${status.text}`}>{status.label}</Text>
          </View>
        </View>

        {/* Barber */}
        <View
          style={{
            backgroundColor: barberColor + '15', // ~10% opacity si hex
          }}
          className="self-start px-2 py-1 rounded-full mb-2"
        >
          <Text style={{ color: barberColor }} className="text-xs font-medium">
            ✂ {item.barber?.name}
          </Text>
        </View>

        {/* Clients + service */}
        <Text className="text-base font-bold text-slate-900 mb-1">
          {item.client?.full_name ?? 'Cliente desconocido'}
        </Text>
        <Text className='text-slate-500 text-sm mb-3'>
          {item.service?.name_es} · {item.service?.duration_minutes} min · {item.service?.price}€
        </Text>

        {/* Actions */}

        <View className='mt-3'>
          <TouchableOpacity
            className={`bg-slate-800 rounded-lg py-2 items-center ${isChangingStatus ? 'opacity-50' : ''
              }`}
            disabled={isChangingStatus}
            onPress={() => setShowStatusModal(true)}
          >
            <Text className='text-white font-semibold text-sm'>
              Editar estado
            </Text>
          </TouchableOpacity>
        </View>

        {/* Edit Status Modal */}
        <Modal
          visible={showStatusModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowStatusModal(false)}
        >
          <Pressable
            className="flex-1 justify-end bg-black/40"
            onPress={() => setShowStatusModal(false)}
          >
            <Pressable
              className="bg-white p-5 rounded-t-3xl"
              onPress={(e) => e.stopPropagation()}
            >
              <Text className="text-lg font-bold mb-4">
                Cambiar estado
              </Text>

              {Object.entries(statusConfig).map(([status, config]) => (
                <TouchableOpacity
                  key={status}
                  className="py-4 border-b border-slate-100"
                  onPress={() => {
                    onChangeStatus(item.id, status as appointment_status)
                    setShowStatusModal(false)
                  }}
                >
                  <Text className="text-base">
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  )
}

export default function BarberDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const { profile } = useAuth()

  const { appointments, isLoading, changeStatus, isChangingStatus } = useAppointments(
    selectedDate,
    viewMode
  )

  // Navigation: move forward/backward by the current view unit ( can be imported function 'e.g: useNavigation' )
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

  return (
    <View className='flex-1 bg-slate-50'>
      <SideMenu />
      {/* Header */}
      <View className='flex-row justify-between items-center px-4 pt-12 pb-4 bg-white border-b border-slate-200'>
        <MenuButton />
        <Text className='text-lg font-bold text-slate-900'>Mi Agenda</Text>
        <View className='w-8' />
      </View>

      {/* Greeting */}
      <View className='px-4 pt-4 pb-2'>
        <Text className='text-slate-500 text-sm'>Bienvenido,</Text>
        <Text className='text-2x1 font-bold text-slate-900'>{profile?.full_name ?? 'Barbero'}</Text>
      </View>

      {/* View mode selector */}
      <View className='flex-row mx-4 mb-3 bg-slate-100 rounded-x1 p-1'>
        {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            className={`flex-1 py-2 rounded-lg items-center ${viewMode === mode ? 'bg-white shadow' : ''}`}
            onPress={() => setViewMode(mode)}
          >
            <Text className={`text-sm font-medium ${viewMode === mode ? 'text-slate-900' : 'text-slate-400'}`}>
              {mode === 'day' ? 'Hoy' : mode === 'week' ? 'Semana' : 'Mes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {console.log('appointments', appointments)}
      {/* Date navigator */}
      <View className='flex-row items-center justify-between px-4 mb-3'>
        <TouchableOpacity onPress={goBack} className='p-2'>
          <Text className='text-slate-500 text-lg'>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
          <Text className='text-sm font-medium text-slate-700 capitalize'>{dateLabel()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goForward} className='p-2'>
          <Text className='text-slate-500 text-lg'>›</Text>
        </TouchableOpacity>
      </View>

      {/* Appointments count */}
      <View className='px-4 mb-2'>
        <Text className='text-xs text-slate-400'>
          {isLoading ? '...' : `${appointments?.length ?? 0} citas`}
        </Text>
      </View>

      {/* List */}
      {isLoading ? (
        <View className='flex-1 items-center justify-center'>
          <Text className='text-slate-400'>Cargando...</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className='items-center mt-12'>
              <Text className='text-4x1 mb-3'>✂️</Text>
              <Text className='text-slate-50 font-medium'>No hay citas para esta fecha</Text>
            </View>
          }
          renderItem={({ item }) => (
            <AppointmentCard
              item={item}
              onChangeStatus={(id, status) =>
                changeStatus({
                  id,
                  status
                })
              }
              isChangingStatus={isChangingStatus}
            />
          )}
        />
      )}
    </View>
  )
}