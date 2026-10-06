-- Productos de ejemplo para visualizar la carta (monto en soles).
-- Ids fijos para que la migración sea idempotente.

insert into products (id, category_id, name, description, price, sort_order, is_available)
select *
from (values
  ('a0000001-0000-4000-8000-000000000001'::uuid, (select id from categories where slug = 'caldo-de-gallina'), 'Caldo de gallina', 'Con papa amarilla, fideo y cancha. Receta de la casa.', 16.00::numeric, 1, true),
  ('a0000001-0000-4000-8000-000000000002'::uuid, (select id from categories where slug = 'caldo-de-gallina'), 'Caldo especial con huevo', 'Caldo de gallina con huevo cocido extra.', 18.00::numeric, 2, true),
  ('a0000001-0000-4000-8000-000000000003'::uuid, (select id from categories where slug = 'mostritos'), 'Mostrito broaster', '1/8 de pollo broaster + chaufa + papa frita.', 15.00::numeric, 1, true),
  ('a0000001-0000-4000-8000-000000000004'::uuid, (select id from categories where slug = 'mostritos'), 'Mostrito alitas BBQ', 'Alitas bañadas en salsa BBQ + chaufa.', 17.00::numeric, 2, false),
  ('a0000001-0000-4000-8000-000000000005'::uuid, (select id from categories where slug = 'broaster'), 'Broaster 1/4', 'Cuarto de pollo crocante con papas fritas.', 14.00::numeric, 1, true),
  ('a0000001-0000-4000-8000-000000000006'::uuid, (select id from categories where slug = 'chocolate'), 'Chocolate caliente', 'Chocolate espeso de la casa, ideal con picarones.', 6.00::numeric, 1, true),
  ('a0000001-0000-4000-8000-000000000007'::uuid, (select id from categories where slug = 'panqueques'), 'Panqueque con miel', 'Panqueque suave con miel y mantequilla.', 8.00::numeric, 1, true),
  ('a0000001-0000-4000-8000-000000000008'::uuid, (select id from categories where slug = 'picarones'), 'Porción de picarones', 'Picarones dorados con miel de chancaca.', 10.00::numeric, 1, true)
) as v(id, category_id, name, description, price, sort_order, is_available)
on conflict (id) do nothing;
