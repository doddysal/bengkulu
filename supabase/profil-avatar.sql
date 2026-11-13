alter table public.pengguna add column if not exists avatar_url text;
drop policy if exists pengguna_update_sendiri on public.pengguna;
create policy pengguna_update_sendiri on public.pengguna for update to authenticated using(id=auth.uid()) with check(id=auth.uid());