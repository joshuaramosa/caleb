-- Seed para desarrollo local (`supabase db reset`).
-- En producción/staging, los mismos datos base se aplican con la migración
-- 00000000000003_seed_base.sql (idempotente, `on conflict do nothing`).

insert into categories (name, slug, sort_order) values
  ('BRASA',            'brasa',            1),
  ('SALCHIBRASAS',     'salchibrasas',     2),
  ('BROASTER',         'broaster',         3),
  ('BROASTER ESPECIAL','broaster-especial',4),
  ('SALCHIBROSTERS',   'salchibrosters',   5),
  ('COMBOS ESPECIALES','combos-especiales',6)
on conflict (slug) do nothing;

insert into business_settings (
  id, business_name, whatsapp, delivery_fee, open_time, close_time, is_open
) values (
  1, 'Pollería Don Caleb', '986749190', 2.00, '12:00', '22:30', true
)
on conflict (id) do update set
  business_name = excluded.business_name,
  whatsapp = excluded.whatsapp,
  open_time = excluded.open_time,
  close_time = excluded.close_time;
