/**
 * Actualiza las contraseñas del personal en Supabase Auth según su rol:
 *   ADMIN       -> @admin123
 *   COCINA      -> @cocina123
 *   REPARTIDOR  -> @repartidor123
 *
 * Uso: node scripts/update-staff-passwords.mjs
 * Lee NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY desde .env.local.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const PASSWORD_BY_ROLE = {
  ADMIN: "@admin123",
  COCINA: "@cocina123",
  REPARTIDOR: "@repartidor123",
};

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: staff, error } = await supabase
  .from("users")
  .select("id, full_name, role")
  .eq("is_active", true);

if (error) {
  console.error("Error leyendo usuarios:", error.message);
  process.exit(1);
}

for (const user of staff) {
  const newPassword = PASSWORD_BY_ROLE[user.role];
  if (!newPassword) {
    console.log(`- ${user.full_name} (${user.role}): sin cambio (rol sin regla)`);
    continue;
  }
  const { error: upErr } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });
  if (upErr) {
    console.error(`✗ ${user.full_name} (${user.role}): ${upErr.message}`);
  } else {
    console.log(`✓ ${user.full_name} (${user.role}) -> ${newPassword}`);
  }
}

console.log("Listo.");
