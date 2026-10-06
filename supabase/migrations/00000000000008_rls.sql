-- =============================================
-- Etapa 14 — Row Level Security en todas las tablas
-- =============================================

-- Rol del usuario autenticado (security definer evita recursión con la tabla users)
create or replace function public.current_staff_role()
returns user_role
language sql stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid() and is_active;
$$;

-- ---------- users ----------
alter table users enable row level security;
create policy "users: leer el propio perfil"
  on users for select using (id = auth.uid());
create policy "users: ADMIN todo"
  on users for all using (public.current_staff_role() = 'ADMIN')
  with check (public.current_staff_role() = 'ADMIN');

-- ---------- categories ----------
alter table categories enable row level security;
create policy "categories: lectura pública" on categories for select using (true);
create policy "categories: ADMIN escribe"
  on categories for all using (public.current_staff_role() = 'ADMIN')
  with check (public.current_staff_role() = 'ADMIN');

-- ---------- products ----------
alter table products enable row level security;
create policy "products: lectura pública" on products for select using (true);
create policy "products: ADMIN escribe"
  on products for all using (public.current_staff_role() = 'ADMIN')
  with check (public.current_staff_role() = 'ADMIN');

-- ---------- business_settings ----------
alter table business_settings enable row level security;
create policy "settings: lectura pública" on business_settings for select using (true);
create policy "settings: ADMIN escribe"
  on business_settings for update using (public.current_staff_role() = 'ADMIN')
  with check (public.current_staff_role() = 'ADMIN');

-- ---------- customers ----------
-- Sin acceso público. La creación la hace el RPC create_order (security definer).
alter table customers enable row level security;
create policy "customers: staff (admin/atencion/repartidor) lee"
  on customers for select
  using (public.current_staff_role() in ('ADMIN', 'ATENCION', 'REPARTIDOR'));
create policy "customers: admin/atencion escribe"
  on customers for all
  using (public.current_staff_role() in ('ADMIN', 'ATENCION'))
  with check (public.current_staff_role() in ('ADMIN', 'ATENCION'));

-- ---------- addresses ----------
alter table addresses enable row level security;
create policy "addresses: staff lee"
  on addresses for select
  using (public.current_staff_role() in ('ADMIN', 'ATENCION', 'REPARTIDOR'));
create policy "addresses: admin/atencion escribe"
  on addresses for all
  using (public.current_staff_role() in ('ADMIN', 'ATENCION'))
  with check (public.current_staff_role() in ('ADMIN', 'ATENCION'));

-- ---------- orders ----------
-- La creación pública la hace el RPC create_order; aquí no hay select para anónimos.
alter table orders enable row level security;
create policy "orders: admin/atencion/cocina leen"
  on orders for select
  using (public.current_staff_role() in ('ADMIN', 'ATENCION', 'COCINA'));
create policy "orders: repartidor lee solo lo asignado"
  on orders for select
  using (
    public.current_staff_role() = 'REPARTIDOR'
    and exists (
      select 1 from delivery_assignments da
      where da.order_id = orders.id and da.delivery_user_id = auth.uid()
    )
  );
create policy "orders: admin/atencion/cocina actualizan"
  on orders for update
  using (public.current_staff_role() in ('ADMIN', 'ATENCION', 'COCINA'))
  with check (public.current_staff_role() in ('ADMIN', 'ATENCION', 'COCINA'));
create policy "orders: repartidor actualiza solo lo asignado"
  on orders for update
  using (
    public.current_staff_role() = 'REPARTIDOR'
    and exists (
      select 1 from delivery_assignments da
      where da.order_id = orders.id and da.delivery_user_id = auth.uid()
    )
  )
  with check (
    public.current_staff_role() = 'REPARTIDOR'
    and exists (
      select 1 from delivery_assignments da
      where da.order_id = orders.id and da.delivery_user_id = auth.uid()
    )
  );
create policy "orders: admin/atencion insertan"
  on orders for insert
  with check (public.current_staff_role() in ('ADMIN', 'ATENCION'));

-- ---------- order_items ----------
alter table order_items enable row level security;
create policy "order_items: staff lee"
  on order_items for select
  using (public.current_staff_role() is not null);
create policy "order_items: admin/atencion escriben"
  on order_items for all
  using (public.current_staff_role() in ('ADMIN', 'ATENCION'))
  with check (public.current_staff_role() in ('ADMIN', 'ATENCION'));

-- ---------- payments ----------
alter table payments enable row level security;
create policy "payments: staff lee"
  on payments for select
  using (public.current_staff_role() in ('ADMIN', 'ATENCION', 'REPARTIDOR'));
create policy "payments: admin/atencion escriben"
  on payments for all
  using (public.current_staff_role() in ('ADMIN', 'ATENCION'))
  with check (public.current_staff_role() in ('ADMIN', 'ATENCION'));

-- ---------- delivery_assignments ----------
alter table delivery_assignments enable row level security;
create policy "assignments: admin/atencion leen todo"
  on delivery_assignments for select
  using (public.current_staff_role() in ('ADMIN', 'ATENCION'));
create policy "assignments: repartidor lee lo suyo"
  on delivery_assignments for select
  using (delivery_user_id = auth.uid());
create policy "assignments: admin/atencion gestionan"
  on delivery_assignments for all
  using (public.current_staff_role() in ('ADMIN', 'ATENCION'))
  with check (public.current_staff_role() in ('ADMIN', 'ATENCION'));
create policy "assignments: repartidor actualiza lo suyo"
  on delivery_assignments for update
  using (delivery_user_id = auth.uid())
  with check (delivery_user_id = auth.uid());

-- ---------- order_status_history ----------
alter table order_status_history enable row level security;
create policy "history: staff lee"
  on order_status_history for select
  using (public.current_staff_role() is not null);
-- La inserción la hace el trigger (security definer), nadie escribe directamente.

-- =============================================
-- Storage: endurecer buckets existentes
-- =============================================
drop policy if exists "authenticated write products" on storage.objects;
drop policy if exists "authenticated write business" on storage.objects;
drop policy if exists "authenticated upload payment proofs" on storage.objects;

-- products / business: lectura pública (ya existe), escritura solo ADMIN
create policy "admin write products"
  on storage.objects for insert
  with check (bucket_id = 'products' and public.current_staff_role() = 'ADMIN');
create policy "admin update products"
  on storage.objects for update
  using (bucket_id = 'products' and public.current_staff_role() = 'ADMIN');
create policy "admin delete products"
  on storage.objects for delete
  using (bucket_id = 'products' and public.current_staff_role() = 'ADMIN');

create policy "admin write business"
  on storage.objects for insert
  with check (bucket_id = 'business' and public.current_staff_role() = 'ADMIN');
create policy "admin update business"
  on storage.objects for update
  using (bucket_id = 'business' and public.current_staff_role() = 'ADMIN');
create policy "admin delete business"
  on storage.objects for delete
  using (bucket_id = 'business' and public.current_staff_role() = 'ADMIN');

-- payment-proofs: lectura solo ADMIN/ATENCION; la subida la hace el servidor
-- (server action con service role), no el cliente.
create policy "staff read payment proofs"
  on storage.objects for select
  using (bucket_id = 'payment-proofs' and public.current_staff_role() in ('ADMIN', 'ATENCION'));
