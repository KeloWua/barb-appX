import { useEffect } from "react"
import { Slot, useRouter, useSegments } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from "../hooks/useAuth"
import { View, ActivityIndicator } from 'react-native'
import '../global.css' // MANDATORY INYECTION FOR NATIVEWIND 4 
