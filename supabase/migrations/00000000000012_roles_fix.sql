-- Ajustes de roles detectados en auditoría:
-- 1) ATENCION podía entrar a Pedidos y (por RLS) gestionar delivery_assignments,
--    pero no podía LEER la tabla users: la lista de repartidores salía vacía y
--    la asignación de delivery fallaba en silencio. Se habilita la lectura
--    mínima: solo filas con role = 'REPARTIDOR', solo para ADMIN/ATENCION.
-- 2) create_order funcionaba por el EXECUTE por defecto de PUBLIC: se declara
--    explícito para documentar la intención (checkout público).

create policy "users: staff lee repartidores"
  on users for select
  using (role = 'REPARTIDOR' and public.current_staff_role() in ('ADMIN', 'ATENCION'));

grant execute on function public.create_order(jsonb) to anon, authenticated;
