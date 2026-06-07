import { useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useAuthStore } from "../stores/authStore"
import { getCurrentUserRole z from "../lib/auth"