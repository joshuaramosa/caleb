-- =============================================
-- Etapa 3 — Esquema completo BLUX Sabor de Casa
-- =============================================

-- ---------- ENUMs ----------
create type user_role as enum ('ADMIN','ATENCION','COCINA','REPARTIDOR');
create type payment_method as enum ('YAPE','CONTRA_ENTREGA');
create type payment_status as enum ('PENDIENTE','VERIFICADO','RECHAZADO');
create type order_status as enum (
  'NUEVO','CONFIRMADO','EN_PREPARACION','LISTO',
  'ASIGNADO','EN_CAMINO','ENTREGADO','CANCELADO'
);
create type delivery_status as enum ('PENDIENTE','ASIGNADO','EN_CAMINO','ENTREGADO');

-- ---------- users (personal interno) ----------
-- Extiende Supabase Auth: 1 fila por cuenta del personal (admin, atención, cocina, repartidor)
create table users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'ATENCION',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- categories ----------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- products ----------
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete restrict,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- customers ----------
create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null unique,
  created_at timestamptz not null default now()
);

-- ---------- addresses ----------
create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  label text not null default 'Casa',
  address text not null,
  reference text,
  lat double precision,
  lng double precision,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- orders ----------
create sequence if not exists orders_order_number_seq start 1;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer not null unique default nextval('orders_order_number_seq'),
  customer_id uuid not null references customers (id) on delete restrict,
  address_id uuid not null references addresses (id) on delete restrict,
  status order_status not null default 'NUEVO',
  payment_method payment_method not null,
  subtotal numeric(10,2) not null default 0 check (subtotal >= 0),
  delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  total numeric(10,2) not null default 0 check (total >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- order_items (snapshot de precios) ----------
-- product_name y unit_price son COPIA al momento de la venta.
-- Cambios posteriores del producto NO afectan pedidos antiguos.
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_name text not null,          -- snapshot
  unit_price numeric(10,2) not null check (unit_price >= 0), -- snapshot
  quantity integer not null check (quantity > 0),
  line_total numeric(10,2) generated always as (unit_price * quantity) stored,
  notes text
);

-- ---------- payments ----------
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  method payment_method not null,
  status payment_status not null default 'PENDIENTE',
  amount numeric(10,2) not null check (amount >= 0),
  proof_url text,                      -- comprobante Yape (bucket payment-proofs)
  verified_by uuid references users (id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- delivery_assignments ----------
create table delivery_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders (id) on delete cascade,
  delivery_user_id uuid not null references users (id) on delete restrict,
  status delivery_status not null default 'PENDIENTE',
  assigned_at timestamptz not null default now(),
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- business_settings (fila única) ----------
create table business_settings (
  id smallint primary key default 1 check (id = 1), -- singleton
  business_name text not null default 'BLUX Sabor de Casa',
  whatsapp text,
  yape_number text,
  yape_holder text,
  delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  open_time time not null default '17:30',
  close_time time not null default '22:00',
  is_open boolean not null default true,
  logo_url text,
  qr_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Índices ----------
create index idx_orders_status on orders (status);
create index idx_orders_created_at on orders (created_at desc);
create index idx_customers_phone on customers (phone);
create index idx_delivery_assignments_user on delivery_assignments (delivery_user_id);
create index idx_order_items_order on order_items (order_id);
create index idx_products_category on products (category_id);
create index idx_addresses_customer on addresses (customer_id);
create index idx_payments_order on payments (order_id);
create index idx_payments_status on payments (status);
