Fixes #9: restore CreateAppointmentModal wiring in BarberDashboard

  - The picker never opened because CreateAppointmentModal's import was
  commented out and the < CreateAppointmentModal /> render block was
  missing entirely from app / (barber) / index.tsx. `manualHold` was still
  being set correctly after handleEmptySlotPress() created the hold
  (hence the row appearing as `status = 'holding'` in the DB), but
nothing in the tree was listening to that state to mount the modal.

- Re - added:
import { CreateAppointmentModal } from '../../components/calendar/CreateAppointmentModal'

- Re - added the modal render, gated on `manualHold`:
<CreateAppointmentModal
    visible={ !!manualHold }
holdId = { manualHold?.id ?? null}
slotStart = { manualHold?.slotStart ?? null}
onClose = {() => setManualHold(null)}
onSaved = {() => {
  setManualHold(null)
  queryClient.invalidateQueries({ queryKey: ['appointments'] })
}}
  />

  - This was unrelated to the #6 schedule refactor itself(barber_schedules,
    useBarberSchedule, calculateAvailableSlots all work fine) — the modal
  wiring was dropped / commented out at some point during that refactor's
  cleanup and never restored, which is why it looked schedule - related
  but wasn't.
Refs #9



Also removes hooks / useBookedSlots.ts: dead code, unused anywhere in the

app.It duplicated the realtime - availability problem already solved by

getBusySlots() + the barber - ${ barberId } broadcast channel, but relied on

a broadcast event('availability_changed') that nothing ever emitted —

its query cache would've silently gone stale forever if it had been wired

up.Confirmed unused before removal.



  Pending(see follow - up issues):

-[] Barber - facing settings screen to manage their own weekly schedule

  - [] Shop - level setting for opening / closing hours, replacing the

      SHOP_OPEN_HOUR / SHOP_CLOSE_HOUR constants hardcoded in

  BarberDashboard