import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointmentsByDate, updateAppointmentStatus } from '../../lib/repositories/appointmentRepository';
import { format } from 'date-fns';

export default function BarberDashboard() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', today],
    queryFn: () => getAppointmentsByDate(today).then(res => res.data || []),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => updateAppointmentStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold mb-6 mt-12 text-slate-900">Mi Agenda - Hoy</Text>
      {isLoading ? <Text>Cargando...</Text> : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text className="text-slate-500">No tienes citas hoy.</Text>}
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-xl border border-slate-200 mb-3 flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-bold text-slate-800">{format(new Date(item.start_time), 'HH:mm')} - {item.client.full_name}</Text>
                <Text className="text-slate-500">{item.service.name_es}</Text>
                <Text className="text-xs mt-1 text-slate-400">Estado: {item.status}</Text>
              </View>
              {item.status === 'pending' && (
                <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg" onPress={() => mutation.mutate({ id: item.id, status: 'confirmed' })}>
                  <Text className="text-white font-semibold">Confirmar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}