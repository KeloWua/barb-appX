import { View, Text } from 'react-native'
import { START_HOUR, END_HOUR, PX_PER_MINUTE, getDayTotalHeight } from '../../lib/calendarUtils'

export function TimeGrid() {
 const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
 const height = getDayTotalHeight()
 
 return 
}