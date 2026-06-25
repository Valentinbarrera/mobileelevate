/**
 * invite-student.mjs — Alta de alumnos en la plataforma Elevate.
 *
 * Requiere el trigger role-aware `handle_new_user()` (ver docs/add-students.md).
 * Crea el usuario de auth con metadata { role:'student', coach_id, full_name } y
 * el trigger de la base inserta la fila en `students` con id = id del usuario de
 * auth, que es lo que pide RLS ("Students can view their own data": id = auth.uid()).
 *
 * Uso (PowerShell):
 *   $env:SUPABASE_SERVICE_ROLE_KEY="<service_role_key>"
 *   node scripts/invite-student.mjs <emailAlumno> <emailOIdCoach> "<Nombre Completo>" [password]
 *
 *   - CON [password]  → crea el usuario ya confirmado (ideal para probar: entra al instante).
 *   - SIN password    → manda email de invitación para que el alumno ponga su contraseña
 *                       (requiere SMTP configurado en Supabase → Auth → Email).
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// ─── Config ─────────────────────────────────────────────────────────────────
function readEnv(key) {
  if (process.env[key]) return process.env[key];
  try {
    const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
    const m = env.match(new RegExp('^' + key + '=(.*)$', 'm'));
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  } catch { /* sin .env, usamos fallback */ }
  return undefined;
}

const SUPABASE_URL = readEnv('VITE_SUPABASE_URL') || 'https://gssgoeaupfssexhliazy.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌ Falta SUPABASE_SERVICE_ROLE_KEY.');
  console.error('   Obtenela en: Supabase → Project Settings → API → "service_role" (secret).');
  console.error('   Después:');
  console.error('   $env:SUPABASE_SERVICE_ROLE_KEY="<key>"');
  console.error('   node scripts/invite-student.mjs <email> <coach> "<Nombre>" [password]\n');
  process.exit(1);
}

const [, , email, coachRef, fullName, password] = process.argv;
if (!email || !coachRef || !fullName) {
  console.error('\nUso: node scripts/invite-student.mjs <emailAlumno> <emailOIdCoach> "<Nombre Completo>" [password]\n');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const isUuid = (s) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

// ─── Resolver coach_id ──────────────────────────────────────────────────────
let coachId = coachRef;
if (!isUuid(coachRef)) {
  const { data, error } = await admin
    .from('coaches').select('id, email').eq('email', coachRef).maybeSingle();
  if (error) { console.error('❌ Error buscando coach:', error.message); process.exit(1); }
  if (!data) { console.error(`❌ No existe un coach con email ${coachRef}`); process.exit(1); }
  coachId = data.id;
}
console.log(`✔ Coach: ${coachRef} → ${coachId}`);

// ─── Crear o invitar al alumno ──────────────────────────────────────────────
const metadata = { role: 'student', coach_id: coachId, full_name: fullName };

let userId;
if (password) {
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: metadata,
  });
  if (error) { console.error('❌ Error creando usuario:', error.message); process.exit(1); }
  userId = data.user.id;
  console.log('✔ Usuario creado y confirmado (puede iniciar sesión ya).');
} else {
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: metadata });
  if (error) { console.error('❌ Error invitando usuario:', error.message); process.exit(1); }
  userId = data.user.id;
  console.log(`✔ Invitación enviada a ${email} (debe abrir el mail y poner su contraseña).`);
}

// ─── Verificar que el trigger creó la fila en students ──────────────────────
const { data: student } = await admin
  .from('students').select('id, email, coach_id, status').eq('id', userId).maybeSingle();

if (student) {
  console.log(`\n✅ Alumno listo: ${student.email}`);
  console.log(`   id=${student.id}  coach_id=${student.coach_id}  status=${student.status}`);
} else {
  console.warn('\n⚠ El usuario se creó pero NO apareció la fila en students.');
  console.warn('  Casi seguro falta aplicar el trigger role-aware (handle_new_user).');
  console.warn('  Ver docs/add-students.md → "Paso 1".');
}
