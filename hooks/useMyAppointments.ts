import { useQuery } from "@tanstack/react-query";
import { getMyAppointments, getAppointmentById } from "../lib/repositories/appointmentRepository";

export function useMyAppointments() {
    return useQuery({
        queryKey: ["my-appointments"],
        queryFn: async () => {
            const res = await getMyAppointments();
            
            if (res.error)
                throw res.error;

            return res.data ?? [];
        },
    });
}




export function useAppointment(id: string) {
    return useQuery({
        queryKey: ['appointment', id],
        queryFn: async () => {
            const res = await getAppointmentById(id)

            if (res.error)
                throw res.error

            return res.data
        },
    })
}