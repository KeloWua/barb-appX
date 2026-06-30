import { View, Text } from 'react-native'
import { START_HOUR, END_HOUR, PX_PER_MINUTE, getDayTotalHeight } from '../../lib/calendarUtils'

export function TimeGrid() {
   const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
   const height = getDayTotalHeight()

   // Fixed height for the text container so we can perfectly center it over the line
   const LABEL_HEIGHT = 20
   const HALF_LABEL_HEIGHT = LABEL_HEIGHT / 2

   return (
      <View
         className='w-16 bg-gray-50 border-r border-gray-200'
         style={{ height: height + 48 }}
      >
         {/* Space to align with the barbers header */}
         <View className='h-[48px] border-b border-gray-200' />

         <View className='relative flex-1'>
            {hours.map((hour, index) => {
               // Calculate the exact Y coordinates for the full hour and the half hour
               const hourY = index * 60 * PX_PER_MINUTE
               const halfHourY = hourY + (30 * PX_PER_MINUTE)

               return (
                  <View key={hour}>
                     {/* FULL HOUR LABEL */}
                     <View
                        style={{
                           position: 'absolute',
                           top: hourY - HALF_LABEL_HEIGHT,
                           height: LABEL_HEIGHT
                        }}
                        className='w-full flex-row justify-end items-center pr-2'
                     >
                        <Text className='text-xs text-slate-500 font-bold text-right'>
                           {hour.toString().padStart(2, '0')}:00
                        </Text>
                     </View>

                     {/* HALF HOUR LABEL (Skipped on the very last hour) */}
                     {index < hours.length - 1 && (
                        <View
                           style={{
                              position: 'absolute',
                              top: halfHourY - HALF_LABEL_HEIGHT,
                              height: LABEL_HEIGHT
                           }}
                           className='w-full flex-row justify-end items-center pr-2 opacity-40'
                        >
                           <Text className='text-[10px] text-slate-500 font-bold text-right'>
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