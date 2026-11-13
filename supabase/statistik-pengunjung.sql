create table if not exists public.statistik_kunjungan(
  id bigint generated always as identity primary key,
  session_id text not null,
  visitor_id text not null,
  path text not null default '/',
  dibuat_pada timestamptz not null default now()
);
create index if not exists statistik_kunjungan_tanggal_idx on public.statistik_kunjungan(dibuat_pada desc);
create index if not exists statistik_kunjungan_pengunjung_idx on public.statistik_kunjungan(visitor_id);
alter table public.statistik_kunjungan enable row level security;
drop policy if exists statistik_kunjungan_tambah on public.statistik_kunjungan;
create policy statistik_kunjungan_tambah on public.statistik_kunjungan for insert to anon,authenticated with check(true);
create or replace function public.ringkasan_statistik_pengunjung()
returns jsonb language sql stable security definer set search_path=public as $$
select jsonb_build_object(
  'page_views',jsonb_build_object(
    'hari_ini',count(*) filter(where dibuat_pada>=date_trunc('day',now())),
    'kemarin',count(*) filter(where dibuat_pada>=date_trunc('day',now())-interval '1 day' and dibuat_pada<date_trunc('day',now())),
    'bulan_ini',count(*) filter(where dibuat_pada>=date_trunc('month',now())),
    'tahun_ini',count(*) filter(where dibuat_pada>=date_trunc('year',now())),
    'total',count(*)
  ),
  'unique_visitors',jsonb_build_object('total',count(distinct visitor_id)),
  'sessions',jsonb_build_object('total',count(distinct session_id))
) from public.statistik_kunjungan
$$;
grant execute on function public.ringkasan_statistik_pengunjung() to anon,authenticated;