-- El cliente ve el repartidor asignado (nombre + WhatsApp) desde el estado
-- ASIGNADO, no solo cuando ya está EN_CAMINO.

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
  v_settings business_settings%rowtype;
begin
  select * into v_order from orders where tracking_token = upper(trim(p_token));
  if not found then return null; end if;

  select * into v_addr from addresses where id = v_order.address_id;
  select * into v_settings from business_settings where id = 1;

  -- Repartidor asignado visible desde ASIGNADO; posición en vivo solo EN_CAMINO
  if v_order.status in ('ASIGNADO', 'EN_CAMINO') then
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
    'store_lat', v_settings.store_lat,
    'store_lng', v_settings.store_lng,
    'driver_name', v_driver.full_name,
    'driver_phone', case when v_order.status in ('ASIGNADO', 'EN_CAMINO') then v_driver.phone else null end,
    'driver_lat', case when v_order.status = 'EN_CAMINO' then v_assign.last_lat else null end,
    'driver_lng', case when v_order.status = 'EN_CAMINO' then v_assign.last_lng else null end,
    'driver_updated_at', case when v_order.status = 'EN_CAMINO' then v_assign.location_updated_at else null end
  );
end;
$$;

grant execute on function public.get_order_tracking(text) to anon, authenticated;
