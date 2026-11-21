// Prueba de seguridad contra la base real: un visitante anónimo solo puede LEER lo público.
//   node scripts/check-rls.mjs        (usa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY de .env.local)
import { existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } })

let failed = 0
const check = (name, ok, detail = '') => { console.log(`${ok ? 'OK  ' : 'FALLA'} ${name}${detail ? ` — ${detail}` : ''}`); if (!ok) failed++ }

// Lecturas que SÍ deben funcionar (la web pública las usa).
const pets = await db.from('pets').select('id').limit(1)
check('anon lee pets', !pets.error && pets.data.length > 0, pets.error?.message)

// Tablas privadas: sin error pero sin filas (RLS) o con error de permiso.
for (const t of ['profiles', 'admin_users', 'admin_audit_log', 'promo_requests', 'push_subscriptions', 'sightings']) {
  const r = await db.from(t).select('*').limit(1)
  check(`anon no ve ${t}`, r.error != null || r.data.length === 0, r.error?.code ?? `${r.data?.length} filas`)
}

// Escrituras: todas deben fallar o no afectar nada.
const ins = await db.from('pets').insert({ type: 'dog', status: 'lost', last_seen_date: new Date().toISOString(), source_url: 'https://x.test/rls', source_name: 'rls-test' })
check('anon no inserta pets', ins.error != null, ins.error?.code)
const upd = await db.from('pets').update({ name: 'hack' }).eq('source_name', 'Ejemplo (demo)').select()
check('anon no actualiza pets', upd.error != null || upd.data.length === 0, upd.error?.code ?? `${upd.data?.length} filas`)
const del = await db.from('pets').delete().eq('source_name', 'Ejemplo (demo)').select()
check('anon no borra pets', del.error != null || del.data.length === 0, del.error?.code ?? `${del.data?.length} filas`)
const adm = await db.from('admin_users').insert({ user_id: '00000000-0000-0000-0000-000000000000' })
check('anon no se hace admin', adm.error != null, adm.error?.code)

// Funciones: no deben exponer datos privados a anónimos.
const admin = await db.rpc('is_admin')
check('is_admin() es false para anon', admin.data === false, String(admin.data))
const targets = await db.rpc('notification_targets', { p_lat: -12, p_lng: -77, p_exclude: '00000000-0000-0000-0000-000000000000' })
check('notification_targets no es accesible', targets.error != null, targets.error?.code)
const pet = pets.data?.[0]?.id
if (pet) {
  const c = await db.rpc('pet_contact_info', { p_pet: pet })
  const o = c.data?.owner
  check('pet_contact_info no filtra teléfono/correo privados', !c.error && !o?.phone && !o?.whatsapp && !o?.email, c.error?.code)
}

process.exit(failed ? 1 : 0)
