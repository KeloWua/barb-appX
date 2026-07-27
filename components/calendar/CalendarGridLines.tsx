import { View } from 'react-native'
import { PX_PER_MINUTE, COLUMN_WIDTH } from '../../lib/calendarUtils'

interface Props {
    columnsCount: number;
    startHour?: number;
    endHour?: number;
}

export function CalendarGridLines({ columnsCount, startHour = 9, endHour = 21 }: Props) {
    const blocksCount = endHour - startHour
    const halfHourHeight = 30 * PX_PER_MINUTE

    // Calculate exact width: Number of barbers * column width
    const gridWidth = columnsCount * COLUMN_WIDTH

    return (
        <View
            style={{ top: 48, width: gridWidth }}
            className='absolute bottom-0 z-0 pointer-events-none'
        >
            {Array.from({ length: blocksCount }).map((_, i) => (
                <View
                    key={i}
                    style={{ top: i * 60 * PX_PER_MINUTE, position: 'absolute', width: '100%' }}
                >
                    {/* FIRST HALF HOUR (:00 to :30) */}
                    <View
                        style={{ height: halfHourHeight }}
                        className='w-full border-t border-slate-200'
                    />

                    {/* SECOND HALF HOUR (:30 to :00) - ZEBRA EFFECT */}
                    {/* Using solid bg-slate-100 instead of opacity to prevent visual bugs */}
                    <View
                        style={{ height: halfHourHeight }}
                        className='w-full bg-slate-100 border-t border-dashed border-slate-200'
                    />
                </View>
            ))}

            {/* Last grid line to close the calendar at the bottom */}
            <View
                style={{ top: blocksCount * 60 * PX_PER_MINUTE, position: 'absolute', width: '100%' }}
                className='h-[1px] bg-slate-200'
            />
        </View>
    )
}