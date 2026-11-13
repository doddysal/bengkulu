create or replace function public.set_diperbarui_pada() returns trigger language plpgsql as $$ begin new.diperbarui_pada=now();return new;end $$;
drop trigger if exists berita_set_diperbarui on public.berita;
create trigger berita_set_diperbarui before update on public.berita for each row execute function public.set_diperbarui_pada();