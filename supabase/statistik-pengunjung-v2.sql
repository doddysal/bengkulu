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

create or replace function public.catat_dan_ringkas_kunjungan(p_session_id text,p_visitor_id text,p_path text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare hasil jsonb;
begin
  if coalesce(trim(p_session_id),'')='' or coalesce(trim(p_visitor_id),'')='' then
    raise exception 'Identitas statistik tidak valid';
  end if;
  insert into public.statistik_kunjungan(session_id,visitor_id,path)
  values(left(p_session_id,180),left(p_visitor_id,180),left(coalesce(p_path,'/'),500));
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
  ) into hasil from public.statistik_kunjungan;
  return hasil;
end $$;
grant execute on function public.catat_dan_ringkas_kunjungan(text,text,text) to anon,authenticated;