import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const defaultStaff = [
  {
    email: "admin@caleb.pe",
    password: "@admin123",
    full_name: "Administrador Don Caleb",
    role: "ADMIN",
    phone: "986749190",
  },
  {
    email: "cocina@caleb.pe",
    password: "@cocina123",
    full_name: "Jefe de Cocina",
    role: "COCINA",
    phone: "986749190",
  },
  {
    email: "delivery@caleb.pe",
    password: "@repartidor123",
    full_name: "Repartidor Don Caleb",
    role: "REPARTIDOR",
    phone: "986749190",
  },
  {
    email: "atencion@caleb.pe",
    password: "@atencion123",
    full_name: "Atención al Cliente",
    role: "ATENCION",
    phone: "986749190",
  },
];

async function seed() {
  console.log("=== CREANDO USUARIOS DEL PERSONAL EN SUPABASE ===");

  for (const user of defaultStaff) {
    // 1. Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name, role: user.role },
    });

    let userId = authData?.user?.id;

    if (authErr) {
      if (authErr.message.includes("already registered") || authErr.message.includes("exists")) {
        console.log(`Usuario ${user.email} ya existe en Auth, actualizando contraseña...`);
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find((u) => u.email === user.email);
        if (existing) {
          userId = existing.id;
          await supabase.auth.admin.updateUserById(userId, { password: user.password });
        }
      } else {
        console.error(`Error creando auth para ${user.email}:`, authErr.message);
        continue;
      }
    }

    if (userId) {
      // 2. Insert or update users table
      const { error: dbErr } = await supabase.from("users").upsert({
        id: userId,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_active: true,
      });

      if (dbErr) {
        console.error(`Error insertando en tabla users para ${user.email}:`, dbErr.message);
      } else {
        console.log(`✓ Creado/Actualizado: ${user.email} (${user.role}) - Password: ${user.password}`);
      }
    }
  }

  console.log("\nPersonal configurado exitosamente.");
}

seed().catch(console.error);
