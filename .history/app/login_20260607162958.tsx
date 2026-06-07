import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'
import { loginSchema, LoginFormData } from '../types/app'

export default function LoginScreen() {
    const [isLoading, setIsLoading] = useState(false)
    const { control, handleSubmit, formState: { errors } } =
        useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
        })
        setIsLoading(false)
        if (error) Alert.alert('Error', error.message)
    }

    return (
        <View className="flex-1 justify-center px-6 bg-white">
            <Text className="text-3x1 font-bold mb-8 text-slate-900 text-center">Barb-AppX</Text>
            <Controller control={control} name="email" render={({
                field: {
                    onChange, value
                }
            })}>

            </Controller>
        </View>
    )
}
Aquí tienes la guía definitiva, estructurada como un manual de construcción ("Playbook") paso a paso. Todo el código está ajustado para Expo SDK 56, con las versiones exactas, el nombre de tu proyecto (barb-appX), sin helpers de Supabase y listo para copiar y pegar en tu PC.
PASO 1: Creación del Proyecto y Dependencias
Abre tu terminal y ejecuta esto bloque a bloque. Esto creará la base perfecta sin conflictos.
code
Bash
# 1. Crear el proyecto (Expo SDK 56)
npx create-expo-app@latest barb-appX
cd barb-appX

# 2. Instalar binarios nativos (Asegura compatibilidad con React Native 0.85)
npx expo install @react-native-async-storage/async-storage expo-router react-native-screens react-native-safe-area-context react-native-reanimated

# 3. Instalar librerías de lógica JS/TS
npm install @supabase/supabase-js react-native-url-polyfill zustand@5 @tanstack/react-query@5 react-hook-form@7 zod@3 @hookform/resolvers date-fns@3

# 4. Instalar NativeWind 4 y Tailwind 3.4
npm install nativewind@^4.0.0 tailwindcss@^3.4.1 react-native-css-interop
PASO 2: Configuración del Sistema (NativeWind 4)
Sobrescribe estos archivos en la raíz de tu proyecto (barb-appX/):
1. tailwind.config.js
code
JavaScript
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
2. metro.config.js
code
JavaScript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
3. babel.config.js
code
JavaScript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Reanimated SIEMPRE debe ser el último plugin
    plugins: ["react-native-reanimated/plugin"]
  };
};
4. global.css (Crea este archivo en la raíz)
code
CSS
@tailwind base;
@tailwind components;
@tailwind utilities;
PASO 3: Base de Datos y Seguridad (Supabase SQL)
Ve al panel de Supabase > SQL Editor, pega todo este bloque y ejecútalo. Contiene tus tablas y el Row Level Security (RLS).
code
SQL
-- TIPOS
CREATE TYPE user_role AS ENUM ('admin', 'barber', 'client');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

-- TABLAS
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  full_name text NOT NULL,
  email text,
  phone text,
  role user_role DEFAULT 'client',
  avatar_url text,
  is_vip boolean DEFAULT false,
  internal_notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.barbers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id),
  name text NOT NULL,
  photo_url text,
  color_code text DEFAULT '#3b82f6',
  is_active boolean DEFAULT true
);

CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_es text NOT NULL,
  name_en text NOT NULL,
  duration_minutes integer NOT NULL,
  price numeric NOT NULL,
  is_active boolean DEFAULT true
);

CREATE TABLE public.barber_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id uuid REFERENCES public.barbers(id),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_day_off boolean DEFAULT false
);

CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id uuid NOT NULL REFERENCES public.barbers(id),
  client_id uuid NOT NULL REFERENCES public.profiles(id),
  service_id uuid NOT NULL REFERENCES public.services(id),
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status appointment_status DEFAULT 'pending',
  created_by uuid REFERENCES public.profiles(id),
  notes text
);

-- FUNCION HELPER Y SEGURIDAD RLS
CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "profiles_access" ON public.profiles FOR ALL USING (auth.uid() = id OR public.get_my_role() = 'admin');
CREATE POLICY "barbers_read" ON public.barbers FOR SELECT TO authenticated USING (true);
CREATE POLICY "barbers_admin" ON public.barbers FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "services_read" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "services_admin" ON public.services FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY "schedules_read" ON public.barber_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedules_admin" ON public.barber_schedules FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY "appointments_select" ON public.appointments FOR SELECT USING (
  public.get_my_role() = 'admin' OR 
  client_id = auth.uid() OR 
  (public.get_my_role() = 'barber' AND EXISTS (SELECT 1 FROM public.barbers b WHERE b.id = appointments.barber_id AND b.profile_id = auth.uid()))
);
CREATE POLICY "appointments_insert" ON public.appointments FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin' OR 
  (public.get_my_role() = 'client' AND client_id = auth.uid() AND created_by = auth.uid())
);
CREATE POLICY "appointments_update" ON public.appointments FOR UPDATE USING (
  public.get_my_role() = 'admin' OR 
  (public.get_my_role() = 'client' AND client_id = auth.uid() AND status IN ('pending', 'confirmed')) OR
  (public.get_my_role() = 'barber' AND EXISTS (SELECT 1 FROM public.barbers b WHERE b.id = appointments.barber_id AND b.profile_id = auth.uid()))
);
PASO 4: Tipos TypeScript
Crea la carpeta types/ en la raíz.
types/database.ts
code
TypeScript
export type user_role = 'admin' | 'barber' | 'client';
export type appointment_status = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Profile { id: string; full_name: string; email: string | null; phone: string | null; role: user_role; avatar_url: string | null; is_vip: boolean; internal_notes: string | null; created_at: string; }
export interface Barber { id: string; profile_id: string | null; name: string; photo_url: string | null; color_code: string; is_active: boolean; }
export interface Service { id: string; name_es: string; name_en: string; duration_minutes: number; price: number; is_active: boolean; }
export interface BarberSchedule { id: string; barber_id: string; day_of_week: number; start_time: string; end_time: string; is_day_off: boolean; }
export interface Appointment { id: string; barber_id: string; client_id: string; service_id: string; start_time: string; end_time: string; status: appointment_status; created_by: string | null; notes: string | null; }
types/app.ts
code
TypeScript
import { z } from 'zod';
import type { Appointment, Barber, BarberSchedule, Profile, Service } from './database';

export interface BarberWithSchedule extends Barber { schedules: BarberSchedule[]; }
export interface AppointmentWithRelations extends Appointment {
  barber: Pick<Barber, 'id' | 'name' | 'photo_url' | 'color_code'>;
  client: Pick<Profile, 'id' | 'full_name' | 'phone'>;
  service: Pick<Service, 'id' | 'name_es' | 'duration_minutes' | 'price'>;
}

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
export type LoginFormData = z.infer<typeof loginSchema>;
PASO 5: Motor de Autenticación y Supabase
Crea la carpeta lib/ y stores/.
lib/supabase.ts
code
TypeScript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Crea un archivo .env en la raíz con tus claves
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Cliente estricto y único
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
lib/auth.ts
code
TypeScript
import { supabase } from './supabase';
import type { user_role } from '../types/database';

export const getCurrentUserRole = async (userId: string): Promise<user_role | null> => {
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (error || !data) return null;
  return data.role as user_role;
};
stores/authStore.ts
code
TypeScript
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { user_role } from '../types/database';

interface AuthState {
  session: Session | null;
  user: User | null;
  role: user_role | null;
  isInitialized: boolean;
  setAuth: (session: Session | null, role: user_role | null) => void;
  setInitialized: (status: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null, user: null, role: null, isInitialized: false,
  setAuth: (session, role) => set({ session, user: session?.user ?? null, role }),
  setInitialized: (status) => set({ isInitialized: status }),
  clearAuth: () => set({ session: null, user: null, role: null }),
}));
hooks/useAuth.ts
code
TypeScript
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { getCurrentUserRole } from '../lib/auth';

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    let mounted = true;
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const role = await getCurrentUserRole(session.user.id);
        if (mounted) store.setAuth(session, role);
      } else {
        if (mounted) store.clearAuth();
      }
      if (mounted) store.setInitialized(true);
    };
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') store.clearAuth();
      else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        const currentRole = useAuthStore.getState().role;
        const role = currentRole ?? await getCurrentUserRole(session.user.id);
        store.setAuth(session, role);
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  return { ...store, isAuthenticated: !!store.session };
};
PASO 6: Repositorios (Data Access)
Crea lib/repositories/appointmentRepository.ts.
code
TypeScript
import { supabase } from '../supabase';
import type { AppointmentWithRelations } from '../../types/app';
import type { appointment_status } from '../../types/database';

// SQL Puro (Migración): SELECT a.*, b.name, p.full_name, s.name_es FROM appointments a JOIN barbers b...
export const getAppointmentsByDate = async (dateStr: string, barberId?: string) => {
  try {
    let query = supabase.from('appointments').select(`
        *, barber:barbers(id, name, photo_url, color_code),
        client:profiles!appointments_client_id_fkey(id, full_name, phone),
        service:services(id, name_es, duration_minutes, price)
      `)
      .gte('start_time', `${dateStr}T00:00:00.000Z`)
      .lte('start_time', `${dateStr}T23:59:59.999Z`)
      .order('start_time', { ascending: true });

    if (barberId) query = query.eq('barber_id', barberId);
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: data as unknown as AppointmentWithRelations[], error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const updateAppointmentStatus = async (id: string, status: appointment_status) => {
  const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
  return { data, error };
};
PASO 7: Interfaz y Enrutamiento (Expo Router)
1. app/_layout.tsx (El Guardia Global)
code
TypeScript
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import '../global.css'; // INYECCIÓN OBLIGATORIA NATIVEWIND 4

const queryClient = new QueryClient();

function AuthGuard() {
  const { isInitialized, isAuthenticated, role } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && role) {
      if (inAuthGroup || segments.length === 0) {
        if (role === 'admin') router.replace('/(admin)');
        else if (role === 'barber') router.replace('/(barber)');
        else router.replace('/(client)');
      }
    }
  }, [isInitialized, isAuthenticated, role, segments]);

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
  return <Slot />;
}

export default function RootLayout() {
  return <QueryClientProvider client={queryClient}><AuthGuard /></QueryClientProvider>;
}
2. app/(auth)/login.tsx
code
TypeScript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabase';
import { loginSchema, LoginFormData } from '../../types/app';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    setIsLoading(false);
    if (error) Alert.alert('Error', error.message);
  };
 