# Guía de Uso del Sistema Don Caleb (Entorno Local)

Guía paso a paso para probar el flujo completo de un pedido: desde que el cliente ordena hasta que el repartidor entrega.

---

## 1. Levantar el entorno local

**Requisitos:** Node.js 18+ y npm.

```powershell
npm install
```

Crea el archivo `.env.local` en la raíz con las credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vrcdyfbuhphelwebxdbz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<tu_service_role_key>
```

Crea los usuarios del personal (solo la primera vez):

```powershell
node scripts/seed-staff-users.mjs
```

Arranca el servidor de desarrollo:

```powershell
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## 2. Credenciales del personal

Ingreso del personal en **[http://localhost:3000/admin/login](http://localhost:3000/admin/login)**. Cada rol es redirigido automáticamente a su panel:

| Rol | Email | Contraseña | Panel | Acceso |
|---|---|---|---|---|
| **Administrador** | `admin@caleb.pe` | `@admin123` | `/admin` | Pedidos, productos, categorías, clientes, usuarios, promociones, ventas, configuración, cocina y delivery |
| **Atención al Cliente** | `atencion@caleb.pe` | `@atencion123` | `/admin` | Solo el panel `/admin` (gestión de pedidos) |
| **Cocina** | `cocina@caleb.pe` | `@cocina123` | `/cocina` | Tablero de preparación en tiempo real |
| **Repartidor** | `delivery@caleb.pe` | `@repartidor123` | `/delivery` | Pedidos asignados, mapa, caja y cierre de efectivo |

> El **cliente final no necesita cuenta** para pedir: completa sus datos en el checkout y el sistema recuerda su perfil.

---

## 3. Flujo completo del pedido

### Paso 1 — Cliente arma su pedido
Ruta: `http://localhost:3000` o `/carta`

1. Navega la carta por categorías.
2. Toca un producto, elige presentación/extras y agrégalo al carrito.
3. Ve a `/carrito`, revisa cantidades y toca **Ir a pagar**.

### Paso 2 — Cliente confirma el checkout
Ruta: `/checkout`

1. Ingresa su **nombre, teléfono** y marca la **ubicación de entrega** en el mapa.
2. Elige el método de pago:
   - **YAPE**: sube la captura del pago al número/QR configurado.
   - **CONTRA_ENTREGA**: paga en efectivo al recibir.
3. Confirma. El pedido se crea con estado **NUEVO** y pago **PENDIENTE**.
   El cliente es redirigido a su seguimiento en `/pedido/[token]` (guárdalo: es su link único).

### Paso 3 — Atención/Admin confirma el pedido
Panel: `/admin/pedidos`

1. El pedido aparece en tiempo real (con alerta de sonido).
2. Abre el detalle: verifica items, dirección y **comprobante Yape** (si aplica).
3. Si el pago es válido: **verifica el pago** y confirma el pedido → pasa a **CONFIRMADO**.
4. Si el comprobante es inválido: **rechaza el pago** (el pedido queda pendiente de corrección) o cancela el pedido.

### Paso 4 — Cocina prepara
Panel: `/cocina`

1. El pedido confirmado aparece en el tablero como **CONFIRMADO**.
2. Toca **Iniciar preparación** → estado **EN_PREPARACION**.
3. Al terminar, toca **Marcar listo** → estado **LISTO**.

### Paso 5 — Asignación del repartidor
Panel: `/admin/pedidos` (o `/delivery`)

1. Desde el detalle del pedido, el Admin/Atención asigna el pedido listo a un repartidor → estado **ASIGNADO**.
2. El repartidor lo ve de inmediato en `/delivery`.

### Paso 6 — Repartidor sale y entrega
Panel: `/delivery`

1. El repartidor abre el pedido asignado y toca **Iniciar viaje** → estado **EN_CAMINO**.
   - Desde aquí, su ubicación GPS se comparte en vivo; el cliente ve la moto moviéndose en `/pedido/[token]` junto al nombre/teléfono del repartidor.
2. Al llegar, cobra si es **contra entrega** y toca **Marcar entregado** → estado **ENTREGADO**.
   - Si el pago fue contra entrega, el monto pasa a su caja del día.

### Paso 7 — Cierre de caja (efectivo)
Panel: `/delivery` → sección de caja / `/admin` → liquidaciones

- El repartidor ve cuánto efectivo acumuló con pedidos **ENTREGADO + CONTRA_ENTREGA**.
- Admin confirma la **liquidación** (cash settlement) para poner la caja en cero.

---

## 4. Seguimiento y cancelación del cliente

- El cliente sigue el pedido en `/pedido/[token]` (tiempo real vía Supabase Realtime).
- Puede **cancelar** mientras el pedido esté en **NUEVO** o **CONFIRMADO**. Una vez en **EN_PREPARACION**, **LISTO**, **ASIGNADO** o **EN_CAMINO**, la cancelación queda bloqueada (ver migración `00000000000014_cancel_client_block.sql`).
- Sus pedidos anteriores están en `/mis-pedidos` y su perfil guardado en `/perfil`.

---

## 5. Estados de referencia

**Pedido:** `NUEVO → CONFIRMADO → EN_PREPARACION → LISTO → ASIGNADO → EN_CAMINO → ENTREGADO` (o `CANCELADO`)
**Pago:** `PENDIENTE → VERIFICADO` (o `RECHAZADO`)
**Entrega:** `PENDIENTE → ASIGNADO → EN_CAMINO → ENTREGADO`

---

## 6. Notas operativas

- El negocio solo recibe pedidos cuando está **abierto**: configura `is_open`, `open_time`, `close_time` en `/admin/configuracion` (hora Perú, soporta horarios que cruzan medianoche).
- Verifica que la base remota de Supabase tenga aplicadas todas las migraciones de `supabase/migrations/`.
- Abrir varias pestañas (cliente / admin / cocina / delivery) permite probar el flujo completo en tiempo real en la misma PC.
