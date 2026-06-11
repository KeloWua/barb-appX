Voy por aqui


3. Para el repositorio — cambia getAppointmentsByDate a rango
typescriptexport const getAppointmentsByRange = async (
  startDate: string,
  endDate: string,
  barberId?: string
) => {
  try {
    let query = supabase.from('appointments').select(`
      *,
      barber:barbers(id, name, photo_url, color_code),
      client:profiles!appointments_client_id_fkey(id, full_name, phone),
      service:services(id, name_es, duration_minutes, price)
    `)
    .gte('start_time', `${startDate}T00:00:00.000Z`)
    .lte('start_time', `${endDate}T23:59:59.999Z`)
    .order('start_time', { ascending: true })

    if (barberId) query = query.eq('barber_id', barberId)

    const { data, error } = await query
    if (error) throw error
    return { data: data as unknown as AppointmentWithRelations[], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
Puedes mantener getAppointmentsByDate como wrapper si quieres para no romper lo que ya tienes:
typescriptexport const getAppointmentsByDate = (date: string, barberId?: string) =>
  getAppointmentsByRange(date, date, barberId)
