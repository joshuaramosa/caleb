-- =============================================
-- Etapa 3 — Datos semilla base (idempotente)
-- =============================================

-- Categorías iniciales de la carta
insert into categories (name, slug, sort_order) values
  ('BRASA',            'brasa',            1),
  ('SALCHIBRASAS',     'salchibrasas',     2),
  ('BROASTER',         'broaster',         3),
  ('BROASTER ESPECIAL','broaster-especial',4),
  ('SALCHIBROSTERS',   'salchibrosters',   5),
  ('COMBOS ESPECIALES','combos-especiales',6)
on conflict (slug) do nothing;

-- Configuración del negocio (fila única)
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
