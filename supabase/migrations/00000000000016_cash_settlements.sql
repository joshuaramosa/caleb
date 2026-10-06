-- =============================================
-- Caja del repartidor: efectivo "contra entrega"
-- y rendición del dinero al administrador.
-- =============================================

-- 1. Rendiciones de efectivo
create table if not exists cash_settlements (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references users (id) on delete restrict,
  amount numeric(10,2) not null check (amount >= 0),
  status text not null default 'PENDIENTE' check (status in ('PENDIENTE', 'CONFIRMADO')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid references users (id) on delete set null
);

-- 2. Qué pedidos incluye cada rendición (un pedido, una sola rendición)
create table if not exists cash_settlement_orders (
  settlement_id uuid not null references cash_settlements (id) on delete cascade,
  order_id uuid not null unique references orders (id) on delete restrict,
  primary key (settlement_id, order_id)
);

-- 3. Resumen de mi caja (repartidor): efectivo pendiente de entregar + mis rendiciones
create or replace function public.get_my_cash_summary()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_amount numeric(10,2);
begin
  if v_me is null then raise exception 'NO_AUTH'; end if;

  select coalesce(sum(o.total), 0) into v_amount
    from delivery_assignments da
    join orders o on o.id = da.order_id
   where da.delivery_user_id = v_me
     and da.status = 'ENTREGADO'
     and o.payment_method = 'CONTRA_ENTREGA'
     and o.status = 'ENTREGADO'
     and not exists (
       select 1 from cash_settlement_orders cso where cso.order_id = o.id
     );

  return json_build_object(
    'pending_amount', v_amount,
    'pending_orders', (
      select coalesce(json_agg(json_build_object(
        'id', o.id, 'order_number', o.order_number, 'total', o.total,
        'delivered_at', da.delivered_at
      ) order by da.delivered_at), '[]'::json)
      from delivery_assignments da
      join orders o on o.id = da.order_id
      where da.delivery_user_id = v_me
        and da.status = 'ENTREGADO'
        and o.payment_method = 'CONTRA_ENTREGA'
        and o.status = 'ENTREGADO'
        and not exists (
          select 1 from cash_settlement_orders cso where cso.order_id = o.id
        )
    ),
    'my_settlements', (
      select coalesce(json_agg(json_build_object(
        'id', cs.id, 'amount', cs.amount, 'status', cs.status, 'created_at', cs.created_at
      ) order by cs.created_at desc), '[]'::json)
      from cash_settlements cs
      where cs.driver_id = v_me
    )
  );
end;
$$;

grant execute on function public.get_my_cash_summary() to authenticated;

-- 4. Crear rendición: toma todo lo pendiente de mi caja
create or replace function public.create_my_settlement()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_amount numeric(10,2);
  v_settlement uuid;
begin
  if v_me is null then raise exception 'NO_AUTH'; end if;

  select coalesce(sum(o.total), 0) into v_amount
    from delivery_assignments da
    join orders o on o.id = da.order_id
   where da.delivery_user_id = v_me
     and da.status = 'ENTREGADO'
     and o.payment_method = 'CONTRA_ENTREGA'
     and o.status = 'ENTREGADO'
     and not exists (
       select 1 from cash_settlement_orders cso where cso.order_id = o.id
     );

  if v_amount <= 0 then raise exception 'CAJA_VACIA'; end if;

  insert into cash_settlements (driver_id, amount)
  values (v_me, v_amount)
  returning id into v_settlement;

  insert into cash_settlement_orders (settlement_id, order_id)
  select v_settlement, o.id
    from delivery_assignments da
    join orders o on o.id = da.order_id
   where da.delivery_user_id = v_me
     and da.status = 'ENTREGADO'
     and o.payment_method = 'CONTRA_ENTREGA'
     and o.status = 'ENTREGADO'
     and not exists (
       select 1 from cash_settlement_orders cso where cso.order_id = o.id
     );

  return json_build_object('ok', true, 'amount', v_amount, 'settlement_id', v_settlement);
end;
$$;

grant execute on function public.create_my_settlement() to authenticated;

-- 5. Admin/Atención: rendiciones (pendientes y recientes) con su detalle
create or replace function public.get_settlements()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_role user_role;
begin
  select role into v_role from users where id = v_me;
  if v_role not in ('ADMIN', 'ATENCION') then raise exception 'SIN_PERMISOS'; end if;

  return json_build_object(
    'settlements', (
      select coalesce(json_agg(json_build_object(
        'id', cs.id,
        'amount', cs.amount,
        'status', cs.status,
        'created_at', cs.created_at,
        'confirmed_at', cs.confirmed_at,
        'driver_name', u.full_name,
        'orders', (
          select coalesce(json_agg(json_build_object(
            'order_number', o.order_number, 'total', o.total
          )), '[]'::json)
          from cash_settlement_orders cso
          join orders o on o.id = cso.order_id
          where cso.settlement_id = cs.id
        )
      ) order by cs.created_at desc), '[]'::json)
      from cash_settlements cs
      join users u on u.id = cs.driver_id
    )
  );
end;
$$;

grant execute on function public.get_settlements() to authenticated;

-- 6. Confirmar rendición: admin recibe el dinero → pagos contra entrega pasan a VERIFICADO
create or replace function public.confirm_settlement(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_role user_role;
begin
  select role into v_role from users where id = v_me;
  if v_role not in ('ADMIN', 'ATENCION') then raise exception 'SIN_PERMISOS'; end if;

  update cash_settlements
     set status = 'CONFIRMADO', confirmed_at = now(), confirmed_by = v_me
   where id = p_id and status = 'PENDIENTE';
  if not found then raise exception 'RENDICION_NO_ENCONTRADA'; end if;

  update payments p
     set status = 'VERIFICADO', verified_by = v_me, verified_at = now()
    from cash_settlement_orders cso
   where cso.settlement_id = p_id and p.order_id = cso.order_id;

  return json_build_object('ok', true);
end;
$$;

grant execute on function public.confirm_settlement(uuid) to authenticated;
