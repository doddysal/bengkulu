create table if not exists public.profil_pmi(
  kode_bagian text primary key,
  judul text not null default '',
  data jsonb not null default '{}'::jsonb,
  diperbarui_pada timestamptz not null default now(),
  diperbarui_oleh uuid references auth.users(id)
);
alter table public.profil_pmi enable row level security;
drop policy if exists profil_pmi_baca on public.profil_pmi;
create policy profil_pmi_baca on public.profil_pmi for select to anon,authenticated using(true);
drop policy if exists profil_pmi_kelola on public.profil_pmi;
create policy profil_pmi_kelola on public.profil_pmi for all to authenticated using(public.peran_saat_ini() in('admin','superadmin')) with check(public.peran_saat_ini() in('admin','superadmin'));
insert into public.profil_pmi(kode_bagian,judul,data) values
('sejarah','Sejarah PMI',jsonb_build_object('pengantar','Palang Merah Indonesia hadir untuk menjalankan pelayanan kemanusiaan secara netral, mandiri, dan sukarela.','timeline_nasional',jsonb_build_array(jsonb_build_object('tahun','1945','judul','PMI Didirikan','teks','Palang Merah Indonesia didirikan pada 17 September 1945.','media','','aktif',true)),'timeline_lokal','[]'::jsonb)),
('prinsip','Tujuh Prinsip Dasar',jsonb_build_object('nama',jsonb_build_array('Kemanusiaan','Kesamaan','Kenetralan','Kemandirian','Kesukarelaan','Kesatuan','Kesemestaan'),'teks',jsonb_build_array('Mencegah dan meringankan penderitaan manusia tanpa diskriminasi.','Menolong tanpa membedakan kebangsaan, suku, agama, tingkat sosial, atau pandangan politik.','Tidak memihak dalam pertentangan dan perbedaan politik, ras, agama, atau ideologi.','Menjaga otonomi agar dapat bertindak sesuai prinsip Gerakan.','Memberikan bantuan secara sukarela tanpa mencari keuntungan.','Dalam satu negara hanya ada satu perhimpunan nasional yang terbuka bagi semua.','Semua perhimpunan nasional mempunyai kedudukan, hak, dan tanggung jawab yang sama.'),'gambar',jsonb_build_array('','','','','','',''),'youtube_url','','kutipan','Siamo Tutti Fratelli.')),
('visi_misi','Visi, Misi, dan Struktur',jsonb_build_object('visi','Terwujudnya PMI yang profesional, berintegritas, dan bergerak bersama masyarakat.','misi',jsonb_build_array('Memelihara reputasi dan meningkatkan akuntabilitas organisasi.','Meningkatkan ketersediaan darah yang aman dan berkualitas.','Meningkatkan pelayanan kebencanaan dan kesehatan masyarakat.','Meningkatkan kapasitas relawan dan jejaring kemitraan.'),'masa_bakti','','struktur_gambar','','personel','[]'::jsonb,'unit_tambahan','[]'::jsonb)),
('layanan','Kegiatan dan Layanan',jsonb_build_object('header_subtitle','Layanan dan Pengabdian','header_title','Aksi Kemanusiaan','header_desc','Daftar layanan kemanusiaan PMI Kota Bengkulu untuk masyarakat.','wa_posko','','cta_title','Butuh Layanan Kemanusiaan?','cta_desc','Hubungi markas PMI Kota Bengkulu untuk prosedur permohonan layanan.','services','[]'::jsonb))
on conflict(kode_bagian) do nothing;