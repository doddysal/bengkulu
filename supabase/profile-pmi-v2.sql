-- Menambah field presentasi agar SEMUA teks publik berasal dari admin Profil PMI.
update public.profil_pmi set data = data || jsonb_build_object(
  'label_nasional','Nasional',
  'label_lokal','Kota Bengkulu',
  'judul_timeline','Timeline Nasional dan Kota Bengkulu',
  'tampilkan_hero',true
) where kode_bagian='sejarah';
update public.profil_pmi set data = data || jsonb_build_object(
  'pengantar','Tujuh prinsip yang menjadi landasan seluruh kegiatan Palang Merah Indonesia.',
  'judul_kutipan','Semangat Gerakan',
  'tampilkan_nomor',true
) where kode_bagian='prinsip';
update public.profil_pmi set data = data || jsonb_build_object(
  'judul_visi','Visi',
  'judul_misi','Misi',
  'judul_struktur','Struktur Organisasi',
  'tampilkan_personel',true
) where kode_bagian='visi_misi';
update public.profil_pmi set data = data || jsonb_build_object(
  'empty_text','Layanan belum ditambahkan melalui admin.',
  'button_text','Lihat Detail',
  'whatsapp_text','Hubungi Markas'
) where kode_bagian='layanan';