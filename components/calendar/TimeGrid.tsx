import { View, Text } from 'react-native'
import { START_HOUR, END_HOUR, PX_PER_MINUTE, getDayTotalHeight } from '../../lib/calendarUtils'

export function TimeGrid() {
   const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
   const height = getDayTotalHeight()

   return (
      <View className='w-16 bg-gray-50 border-r border-gray-200'
      style={{ height: height + 50 /* Extra padding top */ }}>
         <View className='h-12 border-b border-gray-200' />
         {/* Space to align with barbers header */}
         <View className='relative flex-1'>
            {hours.map((hour, index) => (
               <View
                  key={hour}
                  style={{ top: index * 60 * PX_PER_MINUTE, position: 'absolute' }}
                  className='w-full flex-row items-start -mt-3' // -mt-3 to align text with the imaginary baseline 
               >
                  <Text className='text-xs text-gray-400 font-medium text-right w-full pr-2'>
                     {hour.toString().padStart(2, '0')}:00
                  </Text>
               </View>
            ))}
         </View>
      </View>
   )
}