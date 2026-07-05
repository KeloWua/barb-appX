import { create } from 'zustand'
import { Barber, Service } from '../types/database'

interface BookingState {
    selectedService: Service | null
    selectedBarber: Barber | null
    selectedDate: string | null
    selectedSlotStart: string | null   
    selectedSlotEnd: string | null     
    holdId: string | null

    setService: (s: Service) => void
    setBarber: (b: Barber) => void
    setDate: (date: string) => void
    setSlot: (start: string, end: string) => void  
    setHold: (id: string | null) => void
    clearBooking: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
    selectedService: null,
    selectedBarber: null,
    selectedDate: null,
    selectedSlotStart: null,
    selectedSlotEnd: null,
    holdId: null,

    setService: (s) => set({ selectedService: s }),
    setBarber: (b) => set({ selectedBarber: b }),
    setDate: (date) => set({ selectedDate: date }),
    setSlot: (start, end) => set({ selectedSlotStart: start, selectedSlotEnd: end }),
    setHold: (id) => set({ holdId: id }),
    clearBooking: () =>
        set({
            selectedService: null,
            selectedBarber: null,
            selectedDate: null,
            selectedSlotStart: null,
            selectedSlotEnd: null,
            holdId: null,
        }),
}))