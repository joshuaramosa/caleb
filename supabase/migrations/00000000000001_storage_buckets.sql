-- Buckets de Storage
-- products y business: públicos (lectura). payment-proofs: privado (solo roles internos).

insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('business', 'business', true),
  ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- Lectura pública solo para buckets públicos
create policy "public read products"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "public read business"
  on storage.objects for select
  using (bucket_id = 'business');

-- Escritura solo para usuarios autenticados (se refinará por roles en etapa de seguridad)
create policy "authenticated write products"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products');

create policy "authenticated write business"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'business');

-- payment-proofs: el usuario autenticado sube, solo roles internos leen (refinar en etapa 14)
create policy "authenticated upload payment proofs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'payment-proofs');
