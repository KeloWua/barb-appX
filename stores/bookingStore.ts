import { create } from "zustand"

interface BookingState {
    serviceId: string | null
    barberId: string | null
    customerId: string | null
    customerName: string | null
    selectedDate: string | null
    holdId: string | null // Tracks current active hold
    
    setService: (id: string) => void
    setBarber: (id: string) => void
    setCustomer: (id: string, name?: string) => void
    setDate: (date: string) => void
    setHold: (id: string | null) => void
    clearBooking: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
    serviceId: null,
    barberId: null,
    customerId: null,
    customerName: null,
    selectedDate: null,
    holdId: null,

    setService: (id) => set({ serviceId: id }),
    setBarber: (id) => set({ barberId: id }),
    setCustomer: (id, name) => set({ customerId: id, customerName: name ?? null }),
    setDate: (date) => set({ selectedDate: date }),
    setHold: (id) => set({ holdId: id }),
    clearBooking: () => set({ 
        serviceId: null,
        barberId: null,
        customerId: null,
        customerName: null,
        selectedDate: null,
        holdId: null})
}))