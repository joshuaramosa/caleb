-- Habilita Supabase Realtime para el flujo de pedidos
-- (cocina escucha nuevos pedidos; delivery y tracking cliente en siguientes etapas)

alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table payments;
alter publication supabase_realtime add table delivery_assignments;
