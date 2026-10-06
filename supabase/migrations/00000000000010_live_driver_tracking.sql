-- Tracking en vivo del motorizado: el cliente ve la posición del repartidor
-- en /pedido/[token] mientras el pedido está EN_CAMINO.

-- 1. Posición actual del repartidor en su asignación activa
alter table delivery_assignments
  add column if not exists last_lat double precision,
  add column if not exists last_lng double precision,
  add column if not exists location_updated_at timestamptz;

-- 2. RPC público: seguimiento por tracking_token (el "token" ya existe y actúa
--    como capacidad: quien tiene el link del pedido puede seguirlo).
--    Solo expone la posición del motorizado mientras está EN_CAMINO.
create or replace function public.get_order_tracking(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order  orders%rowtype;
  v_assign delivery_assignments%rowtype;
  v_addr   addresses%rowtype;
  v_driver users%rowtype;
begin
  select * into v_order from orders where tracking_token = upper(trim(p_token));
  if not found then return null; end if;

  select * into v_addr from addresses where id = v_order.address_id;

  -- Solo reportar repartidor mientras el pedido está EN_CAMINO
  if v_order.status = 'EN_CAMINO' then
    select * into v_assign from delivery_assignments where order_id = v_order.id;
    if found then
      select * into v_driver from users where id = v_assign.delivery_user_id;
    end if;
  end if;

  return json_build_object(
    'status', v_order.status,
    'order_number', v_order.order_number,
    'dest_lat', v_addr.lat,
    'dest_lng', v_addr.lng,
    'driver_lat', v_assign.last_lat,
    'driver_lng', v_assign.last_lng,
    'driver_updated_at', v_assign.location_updated_at,
    'driver_name', v_driver.full_name
  );
end;
$$;

-- Cualquiera con el token puede seguir el pedido (cliente anónimo)
grant execute on function public.get_order_tracking(text) to anon, authenticated;

-- 3. Realtime para la posición (los paneles internos ya se suscriben a esta tabla;
--    el cliente anónimo sigue usando polling al RPC por RLS)
-- (la tabla ya está en la publicación supabase_realtime desde 0007)
