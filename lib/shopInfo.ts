import { Platform } from "react-native"

export const SHOP_ADDRESS = 'C/ Talleres de Carros, 1 '
export const SHOP_NAME = 'Oviedo Moderno Barbería'
export const SHOP_PHONE = '+34611160103'

export const getMapsUrl = () => {
    const query = encodeURIComponent(SHOP_ADDRESS)
    return Platform.OS === 'ios'
        ? `https://maps.apple.com/?q=${query}`
        : `https://www.google.com/maps/search/?api=1&query=${query}`
}