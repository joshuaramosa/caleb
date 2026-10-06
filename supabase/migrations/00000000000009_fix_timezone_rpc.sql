-- Fix: create_order comparaba el horario con localtime (UTC del servidor).
-- Horario real del negocio: America/Lima.

create or replace function public.create_order(payload jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings  business_settings%rowtype;
  v_customer  uuid;
  v_address   uuid;
  v_order_id  uuid;
  v_number    int;
  v_token     text;
  v_item      jsonb;
  v_product   record;
  v_subtotal  numeric(10,2) := 0;
  v_name      text;
  v_phone     text;
  v_reference text;
  v_method    payment_method;
  v_item_count int := 0;
  v_now_local  time;
begin
  -- 1. El negocio debe estar abierto (hora de Perú, no UTC)
  select * into v_settings from business_settings where id = 1;
  if not found or not v_settings.is_open then
    raise exception 'NEGOCIO_CERRADO';
  end if;
  v_now_local := (now() at time zone 'America/Lima')::time;
  if not (
    (v_settings.open_time <= v_settings.close_time
      and v_now_local >= v_settings.open_time
      and v_now_local <  v_settings.close_time)
    or
    (v_settings.open_time > v_settings.close_time
      and (v_now_local >= v_settings.open_time or v_now_local < v_settings.close_time))
  ) then
    raise exception 'NEGOCIO_CERRADO';
  end if;

  -- 2. Validaciones de entrada
  v_name := trim(coalesce(payload->>'customer_name', ''));
  if v_name = '' then raise exception 'FALTA_NOMBRE'; end if;

  v_phone := coalesce(payload->>'phone', '');
  if v_phone !~ '^9\d{8}$' then raise exception 'CELULAR_INVALIDO'; end if;

  v_reference := trim(coalesce(payload->>'reference', ''));
  if v_reference = '' then raise exception 'REFERENCIA_OBLIGATORIA'; end if;

  v_method := (payload->>'payment_method')::payment_method;

  -- 3. Cliente (reutiliza por celular)
  select id into v_customer from customers where phone = v_phone;
  if found then
    update customers set full_name = v_name where id = v_customer;
  else
    insert into customers (full_name, phone) values (v_name, v_phone)
    returning id into v_customer;
  end if;

  -- 4. Dirección
  insert into addresses (customer_id, address, reference, lat, lng)
  values (
    v_customer, v_reference, v_reference,
    nullif(payload->>'lat', '')::float,
    nullif(payload->>'lng', '')::float
  )
  returning id into v_address;

  -- 5. Validar productos y calcular subtotal con precios reales de la base
  for v_item in select * from jsonb_array_elements(payload->'items') loop
    select id, name, price, is_available into v_product
      from products where id = (v_item->>'productId')::uuid;
    if not found or not v_product.is_available then
      raise exception 'PRODUCTO_NO_DISPONIBLE:%', coalesce(v_item->>'name', v_item->>'productId');
    end if;
    if (v_item->>'quantity')::int <= 0 then
      raise exception 'CANTIDAD_INVALIDA';
    end if;
    v_subtotal := v_subtotal + v_product.price * (v_item->>'quantity')::int;
    v_item_count := v_item_count + 1;
  end loop;

  if v_item_count = 0 then raise exception 'CARRITO_VACIO'; end if;

  -- 6. Pedido
  insert into orders (customer_id, address_id, payment_method, subtotal, delivery_fee, total)
  values (v_customer, v_address, v_method, v_subtotal, v_settings.delivery_fee, v_subtotal + v_settings.delivery_fee)
  returning id, order_number, tracking_token into v_order_id, v_number, v_token;

  -- 7. Ítems con snapshot de nombre y precio
  for v_item in select * from jsonb_array_elements(payload->'items') loop
    select id, name, price
      into v_product
      from products
      where id = (v_item->>'productId')::uuid;
    insert into order_items (order_id, product_id, product_name, unit_price, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.price, (v_item->>'quantity')::int);
  end loop;

  -- 8. Pago
  insert into payments (order_id, method, amount, status)
  values (v_order_id, v_method, v_subtotal + v_settings.delivery_fee, 'PENDIENTE');

  return json_build_object('order_id', v_order_id, 'order_number', v_number, 'tracking_token', v_token);
end;
$$;
