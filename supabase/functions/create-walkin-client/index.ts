import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authorized: Authorization header missing' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const jwt = authHeader.replace('Bearer ', '').trim()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(jwt)
    if (callerError || !callerUser) {
      return new Response(
        JSON.stringify({ error: 'Not authorized: invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: callerProfile, error: callerProfileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single()

    if (callerProfileError || !callerProfile || !['barber', 'admin'].includes(callerProfile.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: barber or admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- NEW: check if a reusable walk-in profile already exists ---
    const { data: existingWalkin, error: existingError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('is_walkin', true)
      .maybeSingle()

    if (existingError) throw existingError

    if (existingWalkin) {
      // Already exists: reuse it as-is, nothing to create
      return new Response(JSON.stringify({ data: existingWalkin }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- Doesn't exist yet: try to create it ---
    const fakeEmail = `walkin@barbapp.internal`
    const randomPassword = crypto.randomUUID()

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      password: randomPassword,
      email_confirm: true,
    })

    let userId: string;

    if (authError) {
      // Race condition case: another barber created this user a moment earlier.
      // Instead of failing, look it up and reuse it.
      if (authError.message.includes('already registered') || authError.status === 422) {
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
        const foundUser = existingUser.users.find(u => u.email === fakeEmail)
        if (!foundUser) throw new Error('Error recovering walk-in user after collision')
        userId = foundUser.id // <-- was missing: this is what actually fixes the race condition
      } else {
        throw authError
      }
    } else {
      userId = authData.user!.id
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId!,
        email: fakeEmail,
        full_name: 'Walk-in',
        phone: null,
        role: 'client',
        is_walkin: true,
      })
      .select()
      .single()

    if (profileError) throw profileError

    return new Response(JSON.stringify({ data: profile }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})