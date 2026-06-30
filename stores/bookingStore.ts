import { create } from "zustand"

interface BookingState {
    serviceId: string | null
    barberId: string | null
    selectedDate: string | null
    holdId: string | null // Tracks current active hold
    
    setService: (id: string) => void
    setBarber: (id: string) => void
    setDate: (date: string) => void
    setHold: (id: string | null) => void
    clearBooking: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
    serviceId: null,
    barberId: null,
    selectedDate: null,
    holdId: null,

    setService: (id) => set({ serviceId: id }),
    setBarber: (id) => set({ barberId: id }),
    setDate: (date) => set({ selectedDate: date }),
    setHold: (id) => set({ holdId: id }),
    clearBooking: () => set({ serviceId: null, barberId: null, selectedDate: null, holdId: null})
}))