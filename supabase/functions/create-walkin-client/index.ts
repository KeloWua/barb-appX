import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Browser sends this BEFORE the real petition
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { full_name, phone } = await req.json()

    if (!full_name || typeof full_name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'full_name es obligatorio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const randomSuffix = crypto.randomUUID().slice(0, 8)
    const fakeEmail = `walkin-${randomSuffix}@barbapp.internal`
    const randomPassword = crypto.randomUUID()

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      password: randomPassword,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      throw authError ?? new Error('No se pudo crear el usuario')
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        phone: phone ?? null,
        role: 'client',
      })
      .eq('id', authData.user.id)
      .select()
      .single()

    if (profileError) throw profileError

    return new Response(JSON.stringify({ data: profile }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})