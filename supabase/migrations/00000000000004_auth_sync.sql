-- Sincroniza auth.users -> public.users al crear una cuenta.
-- El rol puede venir en user_metadata.role; por defecto ATENCION.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  meta_role user_role;
begin
  begin
    meta_role := (new.raw_user_meta_data ->> 'role')::user_role;
  exception when others then
    meta_role := 'ATENCION';
  end;

  insert into public.users (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(meta_role, 'ATENCION')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
