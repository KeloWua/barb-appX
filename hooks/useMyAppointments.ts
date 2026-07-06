import { useQuery } from "@tanstack/react-query";
import { getMyAppointments } from "../lib/repositories/appointmentRepository";

export function useMyAppointments() {
    return useQuery({
        queryKey: ["my-appointments"],
        queryFn: async () => {
            const res = await getMyAppointments();
            // DEBUG
            console.log(res.data)
            if (res.error)
                throw res.error;

            return res.data ?? [];
        },
    });
}