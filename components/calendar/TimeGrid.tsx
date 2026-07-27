import { View, Text } from 'react-native'
import { PX_PER_MINUTE, getDayTotalHeight } from '../../lib/calendarUtils'

// Defines the props accepted by the TimeGrid component
interface Props {
   startHour?: number
   endHour?: number
}

// Renders the time column for the calendar
// Defaults to showing hours from 9:00 to 21:00
export function TimeGrid({ startHour = 9, endHour = 21 }: Props) {
   // Generate an array of hours to display
   const hours = Array.from(
      { length: endHour - startHour + 1 },
      (_, i) => startHour + i
   )

   // Calculate the total height of the calendar based on the time range
   const height = getDayTotalHeight(startHour, endHour)

   // Label dimensions used to vertically center hour markers
   const LABEL_HEIGHT = 20
   const HALF_LABEL_HEIGHT = LABEL_HEIGHT / 2

   return (
      <View
         className="w-16 bg-gray-50 border-r border-gray-200"
         style={{ height: height + 48 }}
      >
         {/* Header spacer (matches the calendar header height) */}
         <View className="h-[48px] border-b border-gray-200" />

         <View className="relative flex-1">
            {hours.map((hour, index) => {
               // Vertical position for the current hour
               const hourY = index * 60 * PX_PER_MINUTE

               // Vertical position for the half-hour marker
               const halfHourY = hourY + 30 * PX_PER_MINUTE

               return (
                  <View key={hour}>
                     {/* Full hour label (e.g. 09:00, 10:00) */}
                     <View
                        style={{
                           position: 'absolute',
                           top: hourY - HALF_LABEL_HEIGHT,
                           height: LABEL_HEIGHT,
                        }}
                        className="w-full flex-row justify-end items-center pr-2"
                     >
                        <Text className="text-xs text-slate-500 font-bold text-right">
                           {hour.toString().padStart(2, '0')}:00
                        </Text>
                     </View>

                     {/* Half-hour label (30) between each pair of hours */}
                     {index < hours.length - 1 && (
                        <View
                           style={{
                              position: 'absolute',
                              top: halfHourY - HALF_LABEL_HEIGHT,
                              height: LABEL_HEIGHT,
                           }}
                           className="w-full flex-row justify-end items-center pr-2 opacity-40"
                        >
                           <Text className="text-[10px] text-slate-500 font-bold text-right">
                              30
                           </Text>
                        </View>
                     )}
                  </View>
               )
            })}
         </View>
      </View>
   )
}