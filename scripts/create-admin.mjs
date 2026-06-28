/**
 * Crea el primer usuario admin en Portia.
 * Uso: node scripts/create-admin.mjs <SERVICE_ROLE_KEY>
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://cpxywvxwdnpsrxqjoqjl.supabase.co';
const SERVICE_KEY   = process.argv[2];
const ADMIN_EMAIL   = 'admin@portia.cl';
const ADMIN_PASS    = process.argv[3] || 'Admin2024!';

if (!SERVICE_KEY) {
  console.error('Uso: node scripts/create-admin.mjs <SERVICE_ROLE_KEY> [contraseña]');
  console.error('');
  console.error('Dónde encontrar la SERVICE_ROLE_KEY:');
  console.error('  supabase.com/dashboard → proyecto cpxywvxwdnpsrxqjoqjl → Settings → API → service_role');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('🔍 Buscando edificio...');
  const { data: edificios, error: eBuild } = await supabase.from('edificios').select('id, nombre').limit(1);
  if (eBuild || !edificios?.length) {
    console.error('❌ No se encontró ningún edificio en la BD.', eBuild?.message ?? 'tabla vacía');
    console.error('   Ejecuta primero el seed.sql en el SQL Editor de Supabase.');
    process.exit(1);
  }
  const edificio = edificios[0];
  console.log(`✓ Edificio: ${edificio.nombre} (${edificio.id})`);

  // Buscar si ya existe el usuario
  console.log(`\n👤 Buscando/creando usuario ${ADMIN_EMAIL}...`);
  const { data: { users: allUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = allUsers?.find(u => u.email === ADMIN_EMAIL);

  let userId;
  if (existing) {
    userId = existing.id;
    console.log(`   Ya existe — ID: ${userId}. Actualizando contraseña...`);
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, { password: ADMIN_PASS });
    if (updateErr) { console.error('❌ Error actualizando contraseña:', updateErr.message); process.exit(1); }
    console.log('   ✓ Contraseña actualizada.');
  } else {
    const { data: userData, error: authErr } = await supabase.auth.admin.createUser({
      email:         ADMIN_EMAIL,
      password:      ADMIN_PASS,
      email_confirm: true,
    });
    if (authErr) { console.error('❌ Error creando usuario auth:', authErr.message); process.exit(1); }
    userId = userData.user.id;
    console.log(`✓ Usuario creado: ${userId}`);
  }

  // Upsert perfil admin
  console.log('\n📋 Configurando perfil admin...');
  const { error: profileErr } = await supabase.from('perfiles').upsert({
    id:          userId,
    edificio_id: edificio.id,
    nombre:      'Administrador',
    rol:         'admin',
    activo:      true,
  }, { onConflict: 'id' });

  if (profileErr) {
    console.error('❌ Error creando perfil:', profileErr.message);
    process.exit(1);
  }

  console.log('\n✅ Admin creado exitosamente!');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASS}`);
  console.log(`   Edificio: ${edificio.nombre}`);
  console.log('\n   Entra en: http://localhost:3001');
}

main();
