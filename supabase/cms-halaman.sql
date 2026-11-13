create table if not exists public.cms_halaman(
  id uuid primary key default gen_random_uuid(),
  kode_bagian text not null unique,
  judul text not null default '',
  deskripsi text not null default '',
  pengaturan jsonb not null default '{}'::jsonb,
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);
alter table public.cms_halaman enable row level security;
drop policy if exists cms_halaman_baca on public.cms_halaman;
create policy cms_halaman_baca on public.cms_halaman for select to anon,authenticated using(true);
drop policy if exists cms_halaman_kelola on public.cms_halaman;
create policy cms_halaman_kelola on public.cms_halaman for all to authenticated using(public.peran_saat_ini() in('admin','superadmin')) with check(public.peran_saat_ini() in('admin','superadmin'));
drop trigger if exists cms_halaman_set_diperbarui on public.cms_halaman;
create trigger cms_halaman_set_diperbarui before update on public.cms_halaman for each row execute function public.set_diperbarui_pada();
insert into public.cms_halaman(kode_bagian,judul,deskripsi,pengaturan) values
('hero_utama','Bergerak bersama untuk kemanusiaan di Kota Bengkulu.','Portal informasi kegiatan, relawan, agenda, dan layanan Palang Merah Indonesia Kota Bengkulu.',jsonb_build_object('subtitle','PMI Kota Bengkulu','bg_images','[]'::jsonb,'hero_font','modern','hero_size','besar','hero_align','kiri','hero_overlay','#7f1d1d','hero_opacity','45','show_subtitle',false,'show_title',true,'show_description',true)),
('hero_berita','Kabar Kemanusiaan','Berita terbaru dan liputan kegiatan relawan PMI Kota Bengkulu.',jsonb_build_object('subtitle','Berita PMI','bg_images','[]'::jsonb,'hero_font','modern','hero_size','normal','hero_align','tengah','hero_overlay','#000000','hero_opacity','40','show_subtitle',true,'show_title',true,'show_description',true)),
('hero_donor','Stok Darah Kota Bengkulu','Pantau informasi layanan dan ketersediaan darah PMI Kota Bengkulu.',jsonb_build_object('subtitle','Kemanusiaan','bg_images','[]'::jsonb,'hero_font','modern','hero_size','normal','hero_align','tengah','hero_overlay','#000000','hero_opacity','40','show_subtitle',true,'show_title',true,'show_description',true)),
('hero_relawan','Portal Relawan','Bergabung dan bertumbuh bersama PMR, KSR, dan TSR PMI Kota Bengkulu.',jsonb_build_object('subtitle','Relawan PMI','bg_images','[]'::jsonb,'hero_font','modern','hero_size','normal','hero_align','tengah','hero_overlay','#000000','hero_opacity','40','show_subtitle',true,'show_title',true,'show_description',true)),
('hero_sejarah','Sejarah PMI','Jejak pelayanan kemanusiaan Palang Merah Indonesia.',jsonb_build_object('subtitle','Tentang PMI','bg_images','[]'::jsonb,'hero_align','tengah','hero_overlay','#000000','hero_opacity','40','show_subtitle',true,'show_title',true,'show_description',true)),
('hero_prinsip','Tujuh Prinsip Dasar','Landasan gerakan Palang Merah dan Bulan Sabit Merah Internasional.',jsonb_build_object('subtitle','Prinsip Gerakan','bg_images','[]'::jsonb,'hero_align','tengah','hero_overlay','#000000','hero_opacity','40','show_subtitle',true,'show_title',true,'show_description',true)),
('hero_visi','Visi, Misi, dan Struktur','Arah organisasi dan tata kelola PMI Kota Bengkulu.',jsonb_build_object('subtitle','Tentang PMI','bg_images','[]'::jsonb,'hero_align','tengah','hero_overlay','#000000','hero_opacity','40','show_subtitle',true,'show_title',true,'show_description',true)),
('hero_layanan','Kegiatan dan Layanan','Pelayanan kemanusiaan untuk masyarakat Kota Bengkulu.',jsonb_build_object('subtitle','Layanan PMI','bg_images','[]'::jsonb,'hero_align','tengah','hero_overlay','#000000','hero_opacity','40','show_subtitle',true,'show_title',true,'show_description',true))
on conflict(kode_bagian) do nothing;