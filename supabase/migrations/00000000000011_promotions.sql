-- Promociones del Inicio: reel automático de hasta 5 imágenes (solo imagen).
-- Gestionadas exclusivamente por el rol ADMIN desde /admin/promociones.

create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,             -- URL pública (bucket promotions)
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Máximo 5 promociones ACTIVAS, forzado a nivel de base de datos
create or replace function public.enforce_max_promotions()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_count int;
begin
  if new.is_active then
    select count(*) into v_count
      from promotions
     where is_active and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);
    if v_count >= 5 then
      raise exception 'MAX_5_PROMOS: Solo se permiten 5 promociones activas.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_max_promotions on promotions;
create trigger trg_max_promotions
  before insert or update on promotions
  for each row execute function public.enforce_max_promotions();

-- RLS: lectura pública solo de las activas; gestión completa solo ADMIN
alter table promotions enable row level security;

create policy "promotions: lectura publica o admin"
  on promotions for select
  using (is_active or public.current_staff_role() = 'ADMIN');

create policy "promotions: solo admin escribe"
  on promotions for all
  using (public.current_staff_role() = 'ADMIN')
  with check (public.current_staff_role() = 'ADMIN');

-- Bucket público para las imágenes de promo; escritura solo ADMIN
insert into storage.buckets (id, name, public)
values ('promotions', 'promotions', true)
on conflict (id) do nothing;

create policy "public read promotions bucket"
  on storage.objects for select
  using (bucket_id = 'promotions');

create policy "admin write promotions bucket"
  on storage.objects for insert
  with check (bucket_id = 'promotions' and public.current_staff_role() = 'ADMIN');

create policy "admin update promotions bucket"
  on storage.objects for update
  using (bucket_id = 'promotions' and public.current_staff_role() = 'ADMIN');

create policy "admin delete promotions bucket"
  on storage.objects for delete
  using (bucket_id = 'promotions' and public.current_staff_role() = 'ADMIN');
